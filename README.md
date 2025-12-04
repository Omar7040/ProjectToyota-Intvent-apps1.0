# Toyota Inventory Management System

Sistema de gestión de inventario para dealer Toyota - Manejo de inventario de vehículos, flujo de ventas y gestión de clientes.

## 🚗 Descripción

Este proyecto proporciona aplicaciones web y móvil para manejar el inventario de un dealer de autos Toyota. Las características principales incluyen:

- **Conteo de Inventario**: Seguimiento y conteo de todos los vehículos en el inventario del dealer
- **Flujo de Ventas**: Gestión del proceso de ventas desde el primer contacto hasta la venta completada
- **Gestión de Clientes**: Seguimiento de leads y clientes potenciales
- **Conversión de Ventas**: Estadísticas de conversión de solicitudes a ventas completadas
- **Asistencia al Cliente**: Herramientas para ayudar a los clientes en el proceso de adquisición

## 📦 Estructura del Proyecto

```
ProjectToyota-Intvent-apps1.0/
├── packages/
│   ├── backend/       # API REST con Express.js
│   ├── web/           # Aplicación web con React
│   ├── mobile/        # Aplicación móvil con React Native (placeholder)
│   └── common/        # Tipos y utilidades compartidas
├── package.json       # Configuración del monorepo
└── README.md
```

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js, TypeScript
- **Web**: React 19, Vite, TypeScript, React Router
- **Mobile**: React Native (estructura placeholder)
- **Común**: TypeScript types compartidos

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Omar7040/ProjectToyota-Intvent-apps1.0.git
cd ProjectToyota-Intvent-apps1.0

# Instalar dependencias
npm install

# Construir el paquete común
npm run common:build

# Construir el backend
npm run backend:build
```

## 💻 Desarrollo

### Backend API

```bash
# Iniciar el servidor de desarrollo
npm run backend:dev

# El API estará disponible en http://localhost:3001
```

### Web Application

```bash
# Iniciar el servidor de desarrollo web
npm run web:dev

# La aplicación estará disponible en http://localhost:3000
```

### Ejecutar Tests

```bash
# Ejecutar tests del backend
npm run backend:test

# Ejecutar todos los tests
npm run test
```

## 📡 API Endpoints

### Vehículos
- `GET /api/vehicles` - Listar todos los vehículos
- `GET /api/vehicles/available` - Listar vehículos disponibles
- `GET /api/vehicles/status-count` - Contar vehículos por estado
- `GET /api/vehicles/:id` - Obtener vehículo por ID
- `POST /api/vehicles` - Crear nuevo vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Clientes
- `GET /api/customers` - Listar todos los clientes
- `GET /api/customers/leads` - Listar leads/prospectos
- `GET /api/customers/conversion-stats` - Estadísticas de conversión
- `GET /api/customers/:id` - Obtener cliente por ID
- `POST /api/customers` - Crear nuevo cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

### Ventas
- `GET /api/sales` - Listar todas las ventas
- `GET /api/sales/statistics` - Estadísticas de ventas
- `GET /api/sales/pipeline` - Ver pipeline de ventas
- `GET /api/sales/:id` - Obtener venta por ID
- `POST /api/sales` - Crear nueva venta
- `PUT /api/sales/:id` - Actualizar venta
- `PUT /api/sales/:id/complete` - Completar venta
- `PUT /api/sales/:id/cancel` - Cancelar venta

### Inventario
- `GET /api/inventory/counts` - Historial de conteos
- `GET /api/inventory/counts/latest` - Último conteo
- `GET /api/inventory/summary/:dealerId` - Resumen del inventario
- `POST /api/inventory/counts` - Realizar nuevo conteo

## 📱 Características de la Aplicación Web

- **Dashboard**: Vista general con estadísticas de inventario, ventas y conversión
- **Inventario**: Gestión y visualización de vehículos con filtros y búsqueda
- **Clientes**: Seguimiento de leads y pipeline de conversión
- **Ventas**: Gestión del flujo de ventas con vista de pipeline

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.
