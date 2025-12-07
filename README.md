# ProjectToyota-Intvent-apps1.0

Sistema de gestión de inventario para un concesionario Toyota con control de acceso basado en roles (RBAC) y registro de auditoría administrativa.

## Descripción

En este proyecto trabajamos con una app tanto móvil como web, que maneja el inventario de un dealer, se encarga del conteo de autos y el flujo de ventas del mismo, y cuenta cuántas solicitudes son terminadas en ventas y cuáles son posibles clientes para poder ayudarles en el proceso de adquisición de un auto.

## Características Principales

### Control de Acceso Basado en Roles (RBAC)

El sistema implementa tres niveles de acceso:

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso completo: crear, leer, actualizar, eliminar inventario + gestionar logs |
| **Gerente** | Acceso limitado: crear, leer, actualizar inventario + ver logs. **NO puede eliminar autos** |
| **Empleado** | Acceso de solo lectura al inventario |

### Sistema de Logs Administrativos

- Registro de todas las operaciones de inventario
- Seguimiento de quién realizó cada acción
- Registro de intentos de acceso denegado
- Auditoría completa para administradores

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar demo
npm start

# Ejecutar pruebas
npm test
```

## Estructura del Proyecto

```
src/
├── config/
│   └── roles.js          # Configuración de roles y permisos
├── controllers/
│   ├── inventoryController.js  # Control de inventario con RBAC
│   └── adminLogController.js   # Control de logs administrativos
├── middleware/
│   └── authorization.js  # Middleware de autorización
├── models/
│   ├── User.js           # Modelo de usuario
│   └── Car.js            # Modelo de auto
├── utils/
│   └── adminLogger.js    # Sistema de logging administrativo
└── index.js              # Punto de entrada
```

## Permisos por Rol

### Administrador
- `inventory:read` - Ver inventario
- `inventory:create` - Agregar autos
- `inventory:update` - Actualizar información de autos
- `inventory:delete` - Eliminar autos
- `logs:read` - Ver logs de auditoría
- `logs:manage` - Gestionar logs

### Gerente
- `inventory:read` - Ver inventario
- `inventory:create` - Agregar autos
- `inventory:update` - Actualizar información de autos
- `logs:read` - Ver logs de auditoría
- ❌ **NO tiene** `inventory:delete` - No puede eliminar autos

### Empleado
- `inventory:read` - Ver inventario (solo lectura)

## Ejemplo de Uso

```javascript
const { inventoryController, User, ROLES } = require('./src');

// Crear un gerente
const manager = User.createUser({
  username: 'gerente',
  email: 'gerente@dealer.com',
  role: ROLES.MANAGER,
  name: 'Juan García'
});

// El gerente puede agregar autos
inventoryController.addCar(manager, {
  vin: 'JTDKN3DU0A0123456',
  model: 'Toyota Camry',
  year: 2024,
  color: 'Silver',
  price: 28000
}, (err, car) => {
  if (err) console.log('Error:', err.message);
  else console.log('Auto agregado:', car.model);
});

// El gerente NO puede eliminar autos
inventoryController.deleteCar(manager, 'CAR-1', (err) => {
  if (err) console.log('Acceso denegado:', err.message);
  // Output: Permission denied. Required permission: inventory:delete
});
```

## Licencia

MIT
