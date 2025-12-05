# TOYOTA DAMAGE PRO UNIFIED 2025
import flet as ft
import sqlite3
import os
import cv2
import numpy as np
from datetime import datetime
from PIL import Image

# YOLO Setup
try:
    from ultralytics import YOLO
    model = YOLO("yolov8n.pt")
    YOLO_AVAILABLE = True
except:
    YOLO_AVAILABLE = False
    model = None

# DATABASE
DB_NAME = "toyota_damage_pedidos_pro.db"
db_path = os.path.join(os.path.expanduser("~"), DB_NAME)
conn = sqlite3.connect(db_path, check_same_thread=False)
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS damage_reports (
    id INTEGER PRIMARY KEY,
    vin TEXT,
    placa TEXT,
    fecha TEXT,
    daños TEXT,
    severidad TEXT,
    foto_path TEXT
)''')

c.execute('''CREATE TABLE IF NOT EXISTS repair_orders (
    id INTEGER PRIMARY KEY,
    reporte_id INTEGER,
    fecha_pedido TEXT,
    tipo_pedido TEXT,
    descripcion TEXT,
    estado TEXT,
    FOREIGN KEY(reporte_id) REFERENCES damage_reports(id)
)''')
conn.commit()

def detectar_daños(ruta_foto):
    """Detección de daños con YOLO y OpenCV"""
    try:
        img = cv2.imread(ruta_foto)
        if img is None:
            return "Error: No se pudo cargar la imagen", "Desconocida"
        
        if not YOLO_AVAILABLE:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            if laplacian_var < 50:
                return "Daño severo detectado", "Grave"
            elif laplacian_var < 80:
                return "Abolladura detectada", "Moderada"
            else:
                return "Sin daños detectados", "Perfecto"
        
        results = model(img, conf=0.4)
        daños = []
        severidad = "Perfecto"
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                label = model.names.get(cls, "unknown")
                
                if label == "car" and conf > 0.6:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    crop = img[y1:y2, x1:x2]
                    
                    if crop.size == 0:
                        continue
                    
                    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
                    
                    if laplacian_var < 50:
                        daños.append("Daño severo")
                        severidad = "Grave"
                    elif laplacian_var < 80:
                        daños.append("Abolladura")
                        if severidad != "Grave":
                            severidad = "Moderada"
                    else:
                        daños.append("Rayones leves")
                    
                    edges = cv2.Canny(gray, 50, 150)
                    if np.mean(edges) > 60:
                        daños.append("Cristal roto")
                        severidad = "Grave"
        
        if not daños:
            daños = ["Sin daños visibles"]
            severidad = "Perfecto"
        
        return " | ".join(set(daños)), severidad
        
    except Exception as e:
        return f"Error: {str(e)}", "Desconocida"

def main(page: ft.Page):
    page.title = "TOYOTA DAMAGE PRO UNIFIED"
    page.bgcolor = "#f5f5f5"
    page.padding = 0

    # HEADER
    header = ft.Container(
        content=ft.Column([
            ft.Image(src="https://www.toyota.com/etc.clientlibs/toyota/clientlibs/clientlib-site/resources/images/logos/toyota-logo.png", width=120, height=90, fit="contain"),
            ft.Text("TOYOTA DAMAGE PRO", size=36, weight="bold", color="#c41e3a"),
            ft.Text("UNIFIED 2025", size=16, color="#666"),
        ], alignment="center", spacing=5, horizontal_alignment="center"),
        padding=20,
        bgcolor="white",
        border_radius=0
    )

    # TAB 1: ASSESSMENT
    vin_field = ft.TextField(label="VIN (opcional)", width=300)
    placa_field = ft.TextField(label="Placa (opcional)", width=300)
    image_url_field = ft.TextField(label="URL de imagen o ruta local", width=600, hint_text="Ej: https://... o /ruta/local/foto.jpg")
    preview = ft.Image(width=600, height=400, fit="contain")
    result_text = ft.Text("Esperando foto...", size=20, weight="bold", color="#666")
    severity_text = ft.Text("", size=32, weight="bold", color="#c41e3a")
    progress = ft.ProgressBar(width=600, value=0, color="#2196f3")
    status = ft.Text("Listo", size=14, color="#999")
    
    ia_badge = ft.Container(
        content=ft.Text(
            f"{'✅ YOLO IA' if YOLO_AVAILABLE else '⚡ MODO RÁPIDO'}",
            size=12, weight="bold", color="white"
        ),
        bgcolor="#4CAF50" if YOLO_AVAILABLE else "#FFA726",
        padding=8,
        border_radius=5
    )

    def analyze_photo_from_url(e):
        image_source = image_url_field.value.strip()
        
        if not image_source:
            status.value = "⚠️ Ingresa una URL o ruta"
            page.update()
            return
        
        # Si es URL remota
        if image_source.startswith("http"):
            preview.src = image_source
            progress.value = 0.2
            status.value = "Analizando..."
            result_text.value = ""
            severity_text.value = ""
            page.update()

            # Para URLs no analizamos con YOLO (requeriría descargar)
            # Solo mostramos un análisis simulado
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
            status.value = "❌ Ruta no encontrada"
            page.update()
            return

        preview.src = image_source
        progress.value = 0.2
        status.value = "Analizando..."
        result_text.value = ""
        severity_text.value = ""
        page.update()

        progress.value = 0.6
        page.update()

        daños, severidad = detectar_daños(image_source)

        progress.value = 0.9
        status.value = "Guardando..."
        page.update()

        result_text.value = daños
        result_text.color = "#4CAF50" if "Sin daños" in daños else "#ff5252"
        
        severity_text.value = f"{severidad}"
        severity_text.color = "#4CAF50" if severidad == "Perfecto" else "#FFA726" if severidad == "Moderada" else "#ff5252"

        c.execute(
            "INSERT INTO damage_reports (vin,placa,fecha,daños,severidad,foto_path) VALUES (?,?,?,?,?,?)",
            (vin_field.value or "N/A", placa_field.value or "N/A",
             datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
             daños, severidad, image_source)
        )
        conn.commit()
        
        progress.value = 1.0
        status.value = "✅ Guardado"
        page.update()

    def export_csv(e):
        c.execute("SELECT * FROM damage_reports ORDER BY fecha DESC")
        rows = c.fetchall()
        export_path = os.path.join(os.path.expanduser("~/Desktop"), "reportes_toyota.csv")
        try:
            with open(export_path, "w", encoding="utf-8") as f:
                f.write("ID,VIN,Placa,Fecha,Daños,Severidad\n")
                for r in rows:
                    f.write(f"{r[0]},{r[1]},{r[2]},{r[3]},\"{r[4]}\",{r[5]}\n")
        except:
            pass

    assessment_view = ft.Column([
        ia_badge,
        ft.Text("EVALUACIÓN DE DAÑOS (IA)", size=24, weight="bold", color="#333"),
        ft.Container(height=15),
        
        ft.Row([vin_field, placa_field], alignment="center", spacing=10),
        ft.Container(height=15),
        
        image_url_field,
        ft.Container(height=10),
        
        ft.ElevatedButton(
            "🔍 ANALIZAR IMAGEN",
            on_click=analyze_photo_from_url,
            bgcolor="#2196f3",
            color="white",
            width=600,
            height=50
        ),
        ft.Container(height=20),
        
        preview,
        ft.Container(height=15),
        
        status,
        progress,
        ft.Container(height=15),
        
        ft.Text("DAÑOS:", size=16, weight="bold", color="#333"),
        result_text,
        ft.Text("SEVERIDAD:", size=16, weight="bold", color="#333"),
        severity_text,
        ft.Container(height=30),
        
        ft.ElevatedButton(
            "📊 EXPORTAR CSV",
            on_click=export_csv,
            bgcolor="#ff9800",
            color="white",
            width=500,
            height=50
        ),
    ], alignment="center", spacing=10, horizontal_alignment="center", scroll="adaptive")

    # TAB 2: ORDERS
    order_id = ft.TextField(label="ID Reporte (opcional)", width=200, keyboard_type="number")
    order_type = ft.Dropdown(
        label="Tipo de Pedido",
        width=300,
        options=[
            ft.dropdown.Option("Repuestos"),
            ft.dropdown.Option("Reparación"),
            ft.dropdown.Option("Servicio"),
        ],
        value="Reparación"
    )
    order_desc = ft.TextField(
        label="Descripción",
        multiline=True,
        min_lines=4,
        width=600
    )
    orders_list = ft.ListView(expand=True, spacing=8)

    def load_orders():
        orders_list.controls.clear()
        c.execute("SELECT * FROM repair_orders ORDER BY fecha_pedido DESC")
        rows = c.fetchall()
        
        if not rows:
            orders_list.controls.append(ft.Text("Sin pedidos", size=14, color="#999"))
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
        if not order_desc.value:
            return
        
        rep_id = order_id.value if order_id.value and order_id.value.isdigit() else None
        
        c.execute(
            "INSERT INTO repair_orders (reporte_id, fecha_pedido, tipo_pedido, descripcion, estado) VALUES (?,?,?,?,?)",
            (rep_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
             order_type.value, order_desc.value, "Pendiente")
        )
        conn.commit()
        
        order_id.value = ""
        order_desc.value = ""
        load_orders()
        page.update()

    load_orders()

    orders_view = ft.Column([
        ft.Text("GESTIÓN DE PEDIDOS", size=24, weight="bold", color="#333"),
        ft.Container(height=15),
        
        ft.Row([order_id, order_type], alignment="center", spacing=10),
        order_desc,
        ft.ElevatedButton(
            "✅ REGISTRAR",
            on_click=add_order,
            bgcolor="#9C27B0",
            color="white",
            width=600,
            height=50
        ),
        ft.Container(height=20),
        
        ft.Text("HISTORIAL", size=16, weight="bold", color="#333"),
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

    # BUTTONS PARA CAMBIAR TABS
    tab_buttons = ft.Row([
        ft.ElevatedButton(
            "1. EVALUACIÓN",
            on_click=switch_tab("assessment"),
            bgcolor="#c41e3a",
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

if __name__ == "__main__":
    ft.app(target=main, view=ft.WEB_BROWSER, port=8000)
