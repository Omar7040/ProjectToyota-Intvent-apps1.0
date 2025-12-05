# TOYOTA DAMAGE PRO UNIFIED 2025
import flet as ft
import os
import subprocess
import platform
import tempfile
import shutil
import base64
import sqlite3
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/toyota_app_main.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Importar módulos personalizados
from db_utils import insert_report, insert_order, fetch_reports, fetch_orders, export_reports_csv, export_orders_csv, sanitize_text, conn, c
from detector import detectar_daños, extract_video_frames, YOLO_AVAILABLE
from ui_components import build_header

# PLATFORM DETECTION
SYSTEM = platform.system()
print(f"✅ Sistema operativo: {SYSTEM}")
print(f"✅ Módulos cargados exitosamente")

def open_system_file_dialog():
    """Abre diálogo de archivo"""
    try:
        if SYSTEM == "Darwin":  # macOS
            script = """
            tell application "System Events"
                activate
                set theFile to choose file with prompt "Selecciona foto o video:" of type {"jpg", "jpeg", "png", "mp4", "mov", "avi", "mkv", "webm", "gif", "heic", "bmp", "tiff"}
                return POSIX path of theFile
            end tell
            """
            result = subprocess.run(
                ["osascript", "-e", script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                photo_path = result.stdout.strip()
                if photo_path and os.path.exists(photo_path):
                    return photo_path
    except:
        pass
    
    return None

def open_camera():
    """Abre la cámara para capturar foto (multi-plataforma)"""
    try:
        temp_dir = tempfile.gettempdir()
        output_path = os.path.join(temp_dir, "toyota_camera_capture.jpg")

        # Remove old capture if exists
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass

        if SYSTEM == "Darwin":  # macOS
            # Prefer the ffmpeg in PATH, fallback to common Homebrew location
            ffmpeg_path = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
            if not ffmpeg_path or not os.path.exists(ffmpeg_path):
                print("FFmpeg no encontrado")
                return None

            # Try simple capture without video_size constraint
            cmd = [
                ffmpeg_path, "-f", "avfoundation", "-framerate", "30",
                "-i", "0", "-frames:v", "1", "-update", "1", "-y", output_path
            ]
            try:
                print(f"Ejecutando: {' '.join(cmd)}")
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
                print(f"Return code: {proc.returncode}")
                if proc.stderr:
                    print(f"STDERR: {proc.stderr[:500]}")
            except subprocess.TimeoutExpired:
                print("Timeout al capturar")
                return None
            except Exception as e:
                print(f"Error: {e}")
                return None

            if proc and proc.returncode == 0 and os.path.exists(output_path):
                print(f"Captura exitosa: {output_path}")
                return output_path

            # Try with explicit video size
            for size in ["1280x720", "640x480"]:
                try:
                    alt_cmd = [
                        ffmpeg_path, "-f", "avfoundation", "-video_size", size,
                        "-framerate", "30", "-i", "0", "-frames:v", "1", "-update", "1", "-y", output_path
                    ]
                    print(f"Reintentando con {size}")
                    p2 = subprocess.run(alt_cmd, capture_output=True, text=True, timeout=15)
                    if p2.returncode == 0 and os.path.exists(output_path):
                        print(f"Captura exitosa con {size}")
                        return output_path
                except Exception as e:
                    print(f"Fallo con {size}: {e}")
                    continue
                    
        elif SYSTEM == "Windows":  # Windows
            try:
                import cv2
                cap = cv2.VideoCapture(0)
                if not cap.isOpened():
                    print("No se pudo abrir la cámara")
                    return None
                
                ret, frame = cap.read()
                cap.release()
                
                if ret and frame is not None:
                    cv2.imwrite(output_path, frame)
                    print(f"Captura exitosa Windows: {output_path}")
                    return output_path
                else:
                    print("No se capturó frame")
                    return None
            except ImportError:
                print("OpenCV no instalado")
                return None
            except Exception as e:
                print(f"Error cámara Windows: {e}")
                return None
                
        elif SYSTEM == "Linux":  # Linux
            try:
                import cv2
                cap = cv2.VideoCapture(0)
                if not cap.isOpened():
                    print("No se pudo abrir la cámara")
                    return None
                
                ret, frame = cap.read()
                cap.release()
                
                if ret and frame is not None:
                    cv2.imwrite(output_path, frame)
                    print(f"Captura exitosa Linux: {output_path}")
                    return output_path
                else:
                    print("No se capturó frame")
                    return None
            except ImportError:
                print("OpenCV no instalado")
                return None
            except Exception as e:
                print(f"Error cámara Linux: {e}")
                return None
                
    except Exception as e:
        print(f"Error general en open_camera: {e}")
        pass

    return None

def file_to_data_url(path: str) -> str:
    """Convierte un archivo de imagen local a data URL (base64) para mostrar en Flet web view.
    Devuelve una cadena vacía si falla."""
    try:
        if not os.path.exists(path):
            return ""
        ext = os.path.splitext(path)[1].lower().replace('.', '')
        if ext == 'jpg':
            ext = 'jpeg'
        with open(path, 'rb') as f:
            b = f.read()
        b64 = base64.b64encode(b).decode('ascii')
        return f"data:image/{ext};base64,{b64}"
    except Exception:
        return ""

def main(page: ft.Page):
    page.title = "TOYOTA DAMAGE PRO UNIFIED"
    page.bgcolor = "#f5f5f5"
    page.padding = 0

    # HEADER
    # Header
    header = build_header()

    # INTERNACIONALIZACIÓN
    translations = {
        "es": {
            "app_title": "TOYOTA DAMAGE PRO",
            "assessment": "EVALUACIÓN DE DAÑOS (IA)",
            "orders": "GESTIÓN DE PEDIDOS",
            "vin": "VIN (opcional)",
            "plate": "Placa (opcional)",
            "url_hint": "URL de imagen o ruta local",
            "url_placeholder": "Ej: https://... o /ruta/local/foto.jpg",
            "camera": "📷 CÁMARA",
            "gallery": "🖼️ GALERÍA",
            "analyze": "🔍 ANALIZAR",
            "selected_files": "📁 Archivos Seleccionados:",
            "waiting": "Esperando foto...",
            "ready": "Listo",
            "analyzing": "Analizando...",
            "saved": "✅ Guardado",
            "export_csv": "📊 EXPORTAR CSV",
            "order_id": "ID Reporte (opcional)",
            "order_type": "Tipo de Pedido",
            "description": "Descripción",
            "register": "✅ REGISTRAR",
            "export_orders": "📊 EXPORTAR PEDIDOS CSV",
            "history": "HISTORIAL",
            "no_orders": "Sin pedidos",
            "parts": "Repuestos",
            "repair": "Reparación",
            "service": "Servicio",
            "severity": "SEVERIDAD",
            "damage": "DAÑOS"
        },
        "en": {
            "app_title": "TOYOTA DAMAGE PRO",
            "assessment": "DAMAGE ASSESSMENT (AI)",
            "orders": "ORDER MANAGEMENT",
            "vin": "VIN (optional)",
            "plate": "Plate (optional)",
            "url_hint": "Image URL or local path",
            "url_placeholder": "Ex: https://... or /local/path/photo.jpg",
            "camera": "📷 CAMERA",
            "gallery": "🖼️ GALLERY",
            "analyze": "🔍 ANALYZE",
            "selected_files": "📁 Selected Files:",
            "waiting": "Waiting for photo...",
            "ready": "Ready",
            "analyzing": "Analyzing...",
            "saved": "✅ Saved",
            "export_csv": "📊 EXPORT CSV",
            "order_id": "Report ID (optional)",
            "order_type": "Order Type",
            "description": "Description",
            "register": "✅ REGISTER",
            "export_orders": "📊 EXPORT ORDERS CSV",
            "history": "HISTORY",
            "no_orders": "No orders",
            "parts": "Parts",
            "repair": "Repair",
            "service": "Service",
            "severity": "SEVERITY",
            "damage": "DAMAGE"
        }
    }
    
    current_lang = {"value": "es"}
    
    def get_text(key):
        return translations[current_lang["value"]].get(key, key)
    
    def change_language(e):
        current_lang["value"] = lang_selector.value
        update_ui_texts()
        page.update()
    
    def update_ui_texts():
        """Actualiza todos los textos de la UI según el idioma actual"""
        # Tab 1
        vin_field.label = get_text("vin")
        placa_field.label = get_text("plate")
        image_url_field.label = get_text("url_hint")
        image_url_field.hint_text = get_text("url_placeholder")
        camera_btn.text = get_text("camera")
        gallery_btn.text = get_text("gallery")
        analyze_btn.text = get_text("analyze")
        assessment_title.value = get_text("assessment")
        selected_files_text.value = get_text("selected_files")
        if result_text.value == "Esperando foto..." or result_text.value == "Waiting for photo...":
            result_text.value = get_text("waiting")
        if status.value == "Listo" or status.value == "Ready":
            status.value = get_text("ready")
        export_btn.text = get_text("export_csv")
        
        # Tab 2
        order_id_field.label = get_text("order_id")
        order_type_field.label = get_text("order_type")
        order_type_field.options = [
            ft.dropdown.Option(get_text("parts")),
            ft.dropdown.Option(get_text("repair")),
            ft.dropdown.Option(get_text("service")),
        ]
        order_desc_field.label = get_text("description")
        register_btn.text = get_text("register")
        export_orders_btn.text = get_text("export_orders")
        orders_title.value = get_text("orders")
        history_text.value = get_text("history")
    
    lang_selector = ft.Dropdown(
        label="🌐 Language / Idioma",
        width=180,
        value="es",
        options=[
            ft.dropdown.Option("es", "🇪🇸 Español"),
            ft.dropdown.Option("en", "🇬🇧 English"),
        ],
        on_change=change_language
    )

    # TAB 1: ASSESSMENT
    vin_field = ft.TextField(label=get_text("vin"), expand=True)
    placa_field = ft.TextField(label=get_text("plate"), expand=True)
    image_url_field = ft.TextField(label=get_text("url_hint"), hint_text=get_text("url_placeholder"), expand=True)
    
    # Lista para almacenar múltiples fotos/videos
    media_list = []
    gallery_row = ft.Row([], wrap=True, spacing=10, run_spacing=10, width=600)
    
    preview = ft.Image(width=600, height=400, fit="contain", visible=True)
    result_text = ft.Text(get_text("waiting"), size=20, weight="bold", color="#666")
    severity_text = ft.Text("", size=32, weight="bold", color="#c41e3a")
    progress = ft.ProgressBar(width=600, value=0, color="#2196f3")
    status = ft.Text(get_text("ready"), size=14, color="#999")
    photo_source = {"path": None}
    
    ia_badge = ft.Container(
        content=ft.Text(
            f"{'✅ YOLO IA' if YOLO_AVAILABLE else '⚡ MODO RÁPIDO'}",
            size=12, weight="bold", color="white"
        ),
        bgcolor="#4CAF50" if YOLO_AVAILABLE else "#FFA726",
        padding=8,
        border_radius=5
    )

    def remove_media_item(path):
        """Elimina un item de la galería"""
        def handler(e):
            media_list.remove(path)
            update_gallery()
        return handler
    
    def update_gallery():
        """Actualiza la galería de fotos/videos"""
        gallery_row.controls.clear()
        for media_path in media_list:
            try:
                data_url = file_to_data_url(media_path)
                ext = os.path.splitext(media_path)[1].lower()
                is_video = ext in ['.mp4', '.avi', '.mov', '.mkv', '.webm']
                
                item = ft.Container(
                    content=ft.Stack([
                        ft.Image(
                            src=data_url if not is_video else "",
                            width=120,
                            height=120,
                            fit="cover",
                            border_radius=8
                        ) if not is_video else ft.Container(
                            width=120,
                            height=120,
                            bgcolor="#333",
                            border_radius=8,
                            content=ft.Icon(ft.icons.VIDEOCAM, size=40, color="white")
                        ),
                        ft.Container(
                            content=ft.IconButton(
                                icon=ft.icons.CLOSE,
                                icon_size=16,
                                on_click=remove_media_item(media_path),
                                bgcolor="#ff5252",
                                icon_color="white"
                            ),
                            right=0,
                            top=0
                        )
                    ]),
                    width=120,
                    height=120
                )
                gallery_row.controls.append(item)
            except:
                pass
        page.update()
    
    def select_photo_from_gallery(e):
        """Selecciona foto/video desde la galería"""
        photo_path = open_system_file_dialog()
        
        if photo_path:
            media_list.append(photo_path)
            photo_source["path"] = photo_path
            image_url_field.value = f"{len(media_list)} archivo(s) seleccionado(s)"
            status.value = f"✅ Archivo agregado ({len(media_list)} total)"
            
            # Mostrar preview del último agregado
            try:
                data_url = file_to_data_url(photo_path)
                if data_url:
                    preview.src = data_url
                    preview.visible = True
                else:
                    preview.src = ""
            except Exception as ex:
                status.value = f"Error al mostrar: {str(ex)[:20]}"
            
            update_gallery()
            page.update()
        else:
            status.value = "❌ Selección cancelada"
            page.update()

    def capture_photo_from_camera(e):
        """Captura foto desde la cámara - usa FilePicker con upload para web/móvil"""
        status.value = "📷 Selecciona/Captura una foto..."
        page.update()
        
        # FilePicker con opción de upload para que funcione en web
        camera_picker = ft.FilePicker(
            on_result=handle_camera_upload
        )
        
        # Crear directorio temporal para uploads
        upload_dir = os.path.join(tempfile.gettempdir(), "toyota_uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Configurar upload
        camera_picker.on_upload = handle_upload_complete
        
        page.overlay.append(camera_picker)
        page.update()
        
        # Abrir selector que en móviles mostrará opción de cámara
        camera_picker.pick_files(
            allow_multiple=False,
            allowed_extensions=["jpg", "jpeg", "png", "heic"],
            file_type=ft.FilePickerFileType.IMAGE
        )
    
    def handle_camera_upload(e: ft.FilePickerResultEvent):
        """Inicia el upload del archivo seleccionado"""
        if e.files:
            upload_dir = os.path.join(tempfile.gettempdir(), "toyota_uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            upload_list = []
            for file in e.files:
                upload_list.append(
                    ft.FilePickerUploadFile(
                        file.name,
                        upload_url=page.get_upload_url(file.name, 600)
                    )
                )
            
            # Si es desktop y hay path, usar directamente
            if e.files[0].path:
                photo_path = e.files[0].path
                media_list.append(photo_path)
                photo_source["path"] = photo_path
                image_url_field.value = f"{len(media_list)} archivo(s) seleccionado(s)"
                status.value = f"✅ Foto agregada ({len(media_list)} total)"
                
                try:
                    data_url = file_to_data_url(photo_path)
                    if data_url:
                        preview.src = data_url
                        preview.width = 600
                        preview.height = 400
                        preview.visible = True
                except:
                    pass
                
                update_gallery()
                page.update()
            else:
                # Para web, iniciar upload
                status.value = "⬆️ Subiendo foto..."
                page.update()
                e.control.upload(upload_list)
    
    def handle_upload_complete(e: ft.FilePickerUploadEvent):
        """Maneja la finalización del upload"""
        upload_dir = os.path.join(tempfile.gettempdir(), "toyota_uploads")
        photo_path = os.path.join(upload_dir, e.file_name)
        
        if os.path.exists(photo_path):
            media_list.append(photo_path)
            photo_source["path"] = photo_path
            image_url_field.value = f"{len(media_list)} archivo(s) seleccionado(s)"
            status.value = f"✅ Foto subida ({len(media_list)} total)"
            
            try:
                data_url = file_to_data_url(photo_path)
                if data_url:
                    preview.src = data_url
                    preview.width = 600
                    preview.height = 400
                    preview.visible = True
            except:
                pass
            
            update_gallery()
            page.update()
        else:
            status.value = "❌ Error al subir foto"
            page.update()

    def extract_video_frames(video_path, num_frames=5):
        """Extrae frames de un video para análisis"""
        frames = []
        try:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames < 1:
                cap.release()
                return frames
            
            # Extraer frames distribuidos uniformemente
            frame_indices = np.linspace(0, total_frames-1, num_frames, dtype=int)
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
            
            cap.release()
        except Exception as e:
            print(f"Error extrayendo frames de video: {e}")
        
        return frames

    def analyze_all_media(e):
        """Analiza todas las fotos/videos en la galería"""
        if not media_list:
            status.value = "⚠️ No hay archivos para analizar. Agrega fotos o videos primero."
            page.update()
            return
        
        all_damages = []
        max_severity = "Perfecto"
        
        status.value = "🔍 Iniciando análisis..."
        page.update()
        
        try:
            for idx, media_path in enumerate(media_list):
                if not os.path.exists(media_path):
                    status.value = f"⚠️ Archivo no encontrado: {os.path.basename(media_path)}"
                    continue
                    
                ext = os.path.splitext(media_path)[1].lower()
                is_video = ext in ['.mp4', '.avi', '.mov', '.mkv', '.webm']
                
                progress.value = idx / len(media_list)
                status.value = f"🔍 Analizando {idx+1}/{len(media_list)}: {os.path.basename(media_path)}"
                page.update()
                
                if is_video:
                    # Analizar video frame por frame
                    frames = extract_video_frames(media_path, num_frames=5)
                    status.value = f"Analizando video ({len(frames)} frames)..."
                    page.update()
                    
                    for frame_idx, frame in enumerate(frames):
                        temp_frame_path = os.path.join(tempfile.gettempdir(), f"frame_{frame_idx}.jpg")
                        cv2.imwrite(temp_frame_path, frame)
                        
                        daños, severidad = detectar_daños(temp_frame_path)
                        
                        if "Error" not in daños and "Sin daños" not in daños:
                            all_damages.append(f"🎥 Video frame {frame_idx+1}: {daños}")
                            
                            # Actualizar severidad máxima
                            if severidad == "Grave":
                                max_severity = "Grave"
                            elif severidad == "Moderada" and max_severity != "Grave":
                                max_severity = "Moderada"
                        
                        try:
                            os.remove(temp_frame_path)
                        except:
                            pass
                else:
                    # Analizar imagen
                    try:
                        daños, severidad = detectar_daños(media_path)
                        print(f"Resultado análisis: {daños}, {severidad}")
                        
                        if "Error" not in daños and "Sin daños" not in daños:
                            all_damages.append(f"📷 {os.path.basename(media_path)}: {daños}")
                            
                            # Actualizar severidad máxima
                            if severidad == "Grave":
                                max_severity = "Grave"
                            elif severidad == "Moderada" and max_severity != "Grave":
                                max_severity = "Moderada"
                    except Exception as ex:
                        print(f"Error analizando {media_path}: {ex}")
                        status.value = f"⚠️ Error analizando: {str(ex)[:50]}"
                        page.update()
            
            progress.value = 1.0
            
            if not all_damages:
                result_text.value = f"✅ Sin daños detectados en {len(media_list)} archivo(s)"
                result_text.color = "#4CAF50"
                severity_text.value = "Perfecto"
                severity_text.color = "#4CAF50"
            else:
                result_text.value = "\n".join(all_damages)
                result_text.color = "#ff5252"
                severity_text.value = max_severity
                severity_text.color = "#4CAF50" if max_severity == "Perfecto" else "#FFA726" if max_severity == "Moderada" else "#ff5252"
            
            # Guardar en BD
            try:
                vin = sanitize_text(vin_field.value or "N/A")
                placa = sanitize_text(placa_field.value or "N/A")
                c.execute(
                    "INSERT INTO damage_reports (vin,placa,fecha,daños,severidad,foto_path) VALUES (?,?,?,?,?,?)",
                    (vin, placa,
                     datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                     result_text.value, max_severity, ", ".join(media_list))
                )
                conn.commit()
                status.value = f"✅ Análisis completado: {len(media_list)} archivo(s)"
            except sqlite3.OperationalError as e:
                conn.rollback()
                status.value = f"⚠️ Error DB: {e}"
        except Exception as e:
            print(f"Error general en análisis: {e}")
            status.value = f"❌ Error: {str(e)[:100]}"
        except Exception as e:
            conn.rollback()
            status.value = f"❌ Error guardando: {e}"
        page.update()

    def analyze_photo_from_url(e):
        image_source = image_url_field.value.strip()
        
        if not image_source and not photo_source.get("path"):
            status.value = "⚠️ Ingresa una URL, ruta o selecciona foto"
            page.update()
            return
        
        # Usar la foto seleccionada de galería si está disponible
        if photo_source.get("path") and not image_source.startswith("http"):
            image_source = photo_source["path"]
        
        # Si es URL remota
        if image_source.startswith("http"):
            try:
                preview.src = image_source
            except:
                pass
            progress.value = 0.2
            status.value = "Analizando..."
            result_text.value = ""
            severity_text.value = ""
            page.update()

            progress.value = 0.6
            page.update()

            result_text.value = "Vista previa de imagen cargada"
            result_text.color = "#2196f3"
            
            severity_text.value = "VISTA PREVIA"
            severity_text.color = "#2196f3"
            
            progress.value = 1.0
            status.value = "✅ Imagen cargada (preview)"
            page.update()
            return

        # Si es ruta local
        if not os.path.exists(image_source):
            status.value = f"❌ Archivo no existe: {os.path.basename(image_source)}"
            page.update()
            return

        # Validar que es un archivo de imagen (ampliado para múltiples formatos)
        valid_extensions = (
            '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', 
            '.webp', '.gif', '.heic', '.heif', '.raw',
            '.JPG', '.JPEG', '.PNG', '.BMP', '.TIFF', '.TIF',
            '.WEBP', '.GIF', '.HEIC', '.HEIF'
        )
        if not image_source.lower().endswith(valid_extensions):
            status.value = f"⚠️ Formato no soportado. Soportados: JPG, PNG, BMP, TIFF, WEBP, GIF, HEIC, RAW"
            page.update()
            return

        try:
            data_url = file_to_data_url(image_source)
            if data_url:
                preview.src = data_url
            else:
                preview.src = ""
                status.value = "⚠️ No se pudo mostrar preview"
        except Exception as ex:
            print(f"Error en preview: {ex}")
            pass
        
        progress.value = 0.2
        status.value = "Analizando imagen..."
        result_text.value = ""
        severity_text.value = ""
        page.update()

        progress.value = 0.6
        page.update()

        print(f"Llamando a detectar_daños con: {image_source}")
        daños, severidad = detectar_daños(image_source)
        print(f"Resultado: daños={daños}, severidad={severidad}")

        progress.value = 0.9
        status.value = "Guardando..."
        page.update()

        result_text.value = daños
        result_text.color = "#4CAF50" if "Sin daños" in daños else "#ff5252"
        
        severity_text.value = f"{severidad}"
        severity_text.color = "#4CAF50" if severidad == "Perfecto" else "#FFA726" if severidad == "Moderada" else "#ff5252"

        try:
            vin = sanitize_text(vin_field.value or "N/A")
            placa = sanitize_text(placa_field.value or "N/A")
            c.execute(
                "INSERT INTO damage_reports (vin,placa,fecha,daños,severidad,foto_path) VALUES (?,?,?,?,?,?)",
                (vin, placa,
                 datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                 daños, severidad, image_source)
            )
            conn.commit()
            status.value = "✅ Guardado"
        except sqlite3.OperationalError as e:
            conn.rollback()
            status.value = f"⚠️ Error DB: {e}"
        except Exception as e:
            conn.rollback()
            status.value = f"❌ Error guardando: {e}"
        
        progress.value = 1.0
        page.update()

    def export_csv(e):
        """Exporta reportes a CSV"""
        try:
            c.execute("SELECT * FROM damage_reports ORDER BY fecha DESC")
            rows = c.fetchall()
            export_path = os.path.join(os.path.expanduser("~/Desktop"), "reportes_toyota.csv")
            
            with open(export_path, "w", encoding="utf-8") as f:
                f.write("ID,VIN,Placa,Fecha,Daños,Severidad,Foto\n")
                for r in rows:
                    f.write(f"{r[0]},{r[1]},{r[2]},{r[3]},\"{r[4]}\",{r[5]},{r[6] if len(r)>6 else ''}\n")
            
            logger.info(f"CSV exportado: {export_path}")
            status.value = f"✅ Exportado: {export_path}"
            page.update()
        except Exception as ex:
            logger.error(f"Error exportando CSV: {ex}")
            status.value = f"❌ Error exportando"
            page.update()
    
    def export_orders_csv(e):
        """Exporta órdenes de reparación a CSV"""
        try:
            c.execute("SELECT * FROM repair_orders ORDER BY fecha_pedido DESC")
            rows = c.fetchall()
            export_path = os.path.join(os.path.expanduser("~/Desktop"), "pedidos_toyota.csv")
            
            with open(export_path, "w", encoding="utf-8") as f:
                f.write("ID,Reporte_ID,Fecha,Tipo,Descripción,Estado\n")
                for r in rows:
                    f.write(f"{r[0]},{r[1]},{r[2]},{r[3]},\"{r[4]}\",{r[5]}\n")
            
            logger.info(f"CSV de pedidos exportado: {export_path}")
            pedido_status.value = f"✅ Exportado: {export_path}"
            page.update()
        except Exception as ex:
            logger.error(f"Error exportando CSV de pedidos: {ex}")
            pedido_status.value = f"❌ Error exportando"
            page.update()

    # Crear referencias para los elementos de UI que necesitan actualizarse
    assessment_title = ft.Text(get_text("assessment"), size=24, weight="bold", color="#333")
    selected_files_text = ft.Text(get_text("selected_files"), size=14, weight="bold", color="#666")
    
    camera_btn = ft.ElevatedButton(
        get_text("camera"),
        on_click=capture_photo_from_camera,
        bgcolor="#EB0A1E",
        color="white",
        height=40,
        expand=True
    )
    
    gallery_btn = ft.ElevatedButton(
        get_text("gallery"),
        on_click=select_photo_from_gallery,
        bgcolor="#EB0A1E",
        color="white",
        height=40,
        expand=True
    )
    
    analyze_btn = ft.ElevatedButton(
        get_text("analyze"),
        on_click=analyze_all_media,
        bgcolor="#2196f3",
        color="white",
        height=50,
        expand=True
    )
    
    export_btn = ft.ElevatedButton(
        get_text("export_csv"),
        on_click=export_csv,
        bgcolor="#ff9800",
        color="white",
        height=50,
        expand=True
    )

    assessment_view = ft.Column([
        ft.Row([ia_badge, lang_selector], alignment="spaceBetween"),
        assessment_title,
        ft.Container(height=15),
        
        ft.ResponsiveRow([
            ft.Column([vin_field], col={"xs": 12, "md": 6}),
            ft.Column([placa_field], col={"xs": 12, "md": 6}),
        ]),
        ft.Container(height=15),
        
        image_url_field,
        ft.Container(height=10),
        
        ft.ResponsiveRow([
            ft.Column([camera_btn], col={"xs": 12, "sm": 6}),
            ft.Column([gallery_btn], col={"xs": 12, "sm": 6}),
        ]),
        ft.Container(height=15),
        
        # Galería de archivos seleccionados
        ft.Container(
            content=ft.Column([
                selected_files_text,
                ft.Container(height=5),
                gallery_row,
            ]),
            visible=True,
            padding=10,
            bgcolor="#f9f9f9",
            border_radius=8,
        ),
        ft.Container(height=10),
        
        analyze_btn,
        ft.Container(height=20),
        
        preview,
        ft.Container(height=15),
        
        status,
        progress,
        ft.Container(height=15),
        
        ft.Text(get_text("damage") + ":", size=16, weight="bold", color="#333"),
        result_text,
        ft.Text(get_text("severity") + ":", size=16, weight="bold", color="#333"),
        severity_text,
        ft.Container(height=30),
        
        export_btn,
    ], alignment="center", spacing=10, horizontal_alignment="center", scroll="adaptive")

    # TAB 2: ORDERS
    order_id_field = ft.TextField(label=get_text("order_id"), keyboard_type="number", expand=True)
    
    # Campo de fecha con selector de calendario
    order_date_field = ft.TextField(
        label="Fecha del Pedido (YYYY-MM-DD)",
        value=datetime.now().strftime("%Y-%m-%d"),
        expand=True,
        hint_text="2025-12-04"
    )
    
    def on_date_change(e):
        if e.control.value:
            order_date_field.value = e.control.value.strftime("%Y-%m-%d")
            page.update()
    
    def open_date_picker(e):
        date_picker = ft.DatePicker(
            on_change=on_date_change,
            first_date=datetime(2020, 1, 1),
            last_date=datetime(2030, 12, 31),
        )
        page.overlay.append(date_picker)
        page.update()
        date_picker.open = True
        page.update()
    
    date_picker_btn = ft.ElevatedButton(
        "📅 Calendario",
        on_click=open_date_picker,
        bgcolor="#2196F3",
        color="white",
        height=40
    )
    
    order_type_field = ft.Dropdown(
        label=get_text("order_type"),
        options=[
            ft.dropdown.Option(get_text("parts")),
            ft.dropdown.Option(get_text("repair")),
            ft.dropdown.Option(get_text("service")),
            ft.dropdown.Option("Cambio de Aceite y Filtro"),
            ft.dropdown.Option("Rotación de Neumáticos"),
            ft.dropdown.Option("Alineamiento"),
            ft.dropdown.Option("Chequeo General"),
            ft.dropdown.Option("Chequeo de Fluidos"),
            ft.dropdown.Option("Chequeo de Sistema de Frenos"),
        ],
        value=get_text("repair"),
        expand=True
    )
    order_desc_field = ft.TextField(
        label=get_text("description"),
        multiline=True,
        min_lines=4,
        expand=True
    )
    orders_list = ft.ListView(expand=True, spacing=8)
    pedido_status = ft.Text("", size=14, color="#999")

    def load_orders():
        orders_list.controls.clear()
        c.execute("SELECT * FROM repair_orders ORDER BY fecha_pedido DESC")
        rows = c.fetchall()
        
        if not rows:
            orders_list.controls.append(ft.Text(get_text("no_orders"), size=14, color="#999"))
            return
        
        for r in rows:
            order_id_val, report_id, fecha, tipo, desc, estado = r
            color = "#4CAF50" if estado == "Completado" else "#FFA726"
            
            orders_list.controls.append(
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(f"Pedido #{order_id_val} - {tipo}", weight="bold"),
                            ft.Text(estado, color=color, weight="bold"),
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.Text(f"Fecha: {fecha} | Reporte: {report_id or 'N/A'}", size=12, color="#999"),
                        ft.Text(desc, size=13),
                    ], spacing=3),
                    padding=10,
                    border_radius=5,
                    bgcolor="#f9f9f9",
                    border="1px solid #ddd"
                )
            )
        page.update()

    def add_order(e):
        if not order_desc_field.value:
            return
        
        rep_id = order_id_field.value if order_id_field.value and order_id_field.value.isdigit() else None
        desc = sanitize_text(order_desc_field.value or "")
        tipo = sanitize_text(order_type_field.value or get_text("repair"))
        fecha = order_date_field.value + " " + datetime.now().strftime("%H:%M:%S")
        
        try:
            c.execute(
                "INSERT INTO repair_orders (reporte_id, fecha_pedido, tipo_pedido, descripcion, estado) VALUES (?,?,?,?,?)",
                (rep_id, fecha, tipo, desc, "Pendiente")
            )
            conn.commit()
            order_id_field.value = ""
            order_date_field.value = datetime.now().strftime("%Y-%m-%d")
            order_desc_field.value = ""
            load_orders()
        except sqlite3.OperationalError as e:
            conn.rollback()
            print(f"⚠️ Error DB: {e}")
        except Exception as e:
            conn.rollback()
            print(f"❌ Error agregando pedido: {e}")
        page.update()

    load_orders()

    orders_title = ft.Text(get_text("orders"), size=24, weight="bold", color="#333")
    history_text = ft.Text(get_text("history"), size=16, weight="bold", color="#333")
    
    register_btn = ft.ElevatedButton(
        get_text("register"),
        on_click=add_order,
        bgcolor="#9C27B0",
        color="white",
        height=50,
        expand=True
    )
    
    export_orders_btn = ft.ElevatedButton(
        get_text("export_orders"),
        on_click=export_orders_csv,
        bgcolor="#FF9800",
        color="white",
        height=40,
        expand=True
    )

    orders_view = ft.Column([
        orders_title,
        ft.Container(height=15),
        
        ft.ResponsiveRow([
            ft.Column([order_id_field], col={"xs": 12, "md": 4}),
            ft.Column([
                ft.Row([
                    order_date_field,
                    date_picker_btn
                ], spacing=5)
            ], col={"xs": 12, "md": 8}),
        ]),
        order_type_field,
        order_desc_field,
        register_btn,
        ft.Container(height=20),
        
        export_orders_btn,
        ft.Container(height=10),
        
        history_text,
        ft.Container(
            content=orders_list,
            expand=True,
            bgcolor="white",
            border_radius=5
        ),
    ], spacing=10, horizontal_alignment="center", expand=True, scroll="adaptive")

    # MAIN CONTAINER
    content_area = ft.Container(
        content=assessment_view,
        expand=True,
        padding=20,
        bgcolor="white"
    )

    def switch_tab(view_name):
        def handler(e):
            if view_name == "assessment":
                content_area.content = assessment_view
            else:
                content_area.content = orders_view
            page.update()
        return handler
    
    # Función para cambiar vista según ruta
    def update_view_from_route(route):
        print(f"🔍 Ruta detectada: {route}")  # Debug
        if "pedidos" in route.lower():
            print("📋 Cambiando a vista de PEDIDOS")
            content_area.content = orders_view
        elif "evaluacion" in route.lower():
            print("📸 Cambiando a vista de EVALUACIÓN")
            content_area.content = assessment_view
        else:
            # Ruta por defecto
            content_area.content = assessment_view
        page.update()
    
    # Listener de cambios de ruta
    def route_change(e):
        update_view_from_route(e.route)
    
    page.on_route_change = route_change

    # BUTTONS PARA CAMBIAR TABS
    tab_buttons = ft.Row([
        ft.ElevatedButton(
            "1. EVALUACIÓN",
            on_click=switch_tab("assessment"),
            bgcolor="#EB0A1E",
            color="white",
            expand=True
        ),
        ft.ElevatedButton(
            "2. PEDIDOS",
            on_click=switch_tab("orders"),
            bgcolor="#9C27B0",
            color="white",
            expand=True
        ),
    ], spacing=10)

    page.add(
        header,
        tab_buttons,
        content_area
    )
    
    # Verificar ruta inicial después de que la página esté lista
    if page.route and page.route != "/":
        update_view_from_route(page.route)

if __name__ == "__main__":
    ft.app(target=main, view=ft.WEB_BROWSER, port=8000)
