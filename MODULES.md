# Module Documentation - Toyota Inventory System

This document provides a comprehensive overview of all modules in the Toyota Inventory Management System.

## Architecture Overview

The system follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Entry Point (index.js)       │
└─────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼───────────┐    ┌────────▼─────────┐
│  Controllers  │    │    Middleware    │
└───┬───────────┘    └────────┬─────────┘
    │                         │
┌───▼───────┐        ┌────────▼─────┐
│  Models   │        │   Utilities  │
└───┬───────┘        └──────────────┘
    │
┌───▼───────┐
│  Config   │
└───────────┘
```

## Module Categories

### 1. Configuration (`src/config/`)

#### `roles.js`
**Purpose:** Define roles and permissions for RBAC

**Exports:**
- `ROLES` - Object containing role constants
  - `ADMIN`: 'admin'
  - `MANAGER`: 'manager'
  - `EMPLOYEE`: 'employee'

- `PERMISSIONS` - Object mapping roles to their permissions
  - Admin: All permissions (6 total)
  - Manager: Read, create, update inventory + read logs (4 total)
  - Employee: Read inventory only (1 total)

- `hasPermission(role, permission)` - Check if a role has a specific permission
- `getPermissions(role)` - Get all permissions for a role
- `isValidRole(role)` - Validate if a role exists

**Key Security Feature:** Manager role explicitly DOES NOT have `inventory:delete` permission

**Used By:** All controllers and middleware

---

### 2. Models (`src/models/`)

#### `User.js`
**Purpose:** Manage user data and operations

**Data Structure:**
```javascript
{
  id: 'USER-1',
  username: 'admin',
  email: 'admin@test.com',
  role: 'admin',
  name: 'System Administrator',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}
```

**Exports:**
- `createUser(userData)` - Create a new user with role validation
- `getUserById(userId)` - Retrieve user by ID
- `getUserByUsername(username)` - Retrieve user by username
- `getAllUsers()` - Get all users
- `getUsersByRole(role)` - Filter users by role
- `updateUser(userId, updates)` - Update user information
- `deleteUser(userId)` - Delete a user
- `clearUsers()` - Clear all users (for testing)
- `initializeDefaultUsers()` - Create default test users

**Validation:**
- Role must be valid (admin, manager, or employee)
- Email format validation (basic)
- Username uniqueness (recommended but not enforced)

**Used By:** Controllers for authentication and authorization

#### `Car.js`
**Purpose:** Manage vehicle inventory

**Data Structure:**
```javascript
{
  id: 'CAR-1',
  vin: 'JTDKN3DU0A0123456',
  model: 'Toyota Camry',
  year: 2024,
  color: 'Silver',
  price: 28000,
  status: 'available',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}
```

**Exports:**
- `CAR_STATUS` - Object containing status constants
  - AVAILABLE, RESERVED, SOLD, IN_TRANSIT, MAINTENANCE

- `createCar(carData)` - Add new car to inventory
- `getCarById(carId)` - Retrieve car by ID
- `getCarByVin(vin)` - Retrieve car by VIN
- `getAllCars()` - Get all cars
- `getCarsByStatus(status)` - Filter cars by status
- `getCarsByModel(model)` - Search cars by model name
- `updateCar(carId, updates)` - Update car information
- `deleteCar(carId)` - Remove car from inventory
- `clearCars()` - Clear all cars (for testing)
- `getInventoryStats()` - Get inventory statistics
- `initializeSampleCars()` - Create sample car data

**Validation:**
- VIN must be unique
- Required fields: vin, model, year, color, price

**Used By:** Inventory controller

---

### 3. Controllers (`src/controllers/`)

#### `inventoryController.js`
**Purpose:** Handle inventory operations with RBAC and logging

**Exports:**
- `getAllCars(user, callback)` - Get all cars (requires inventory:read)
- `getCarById(user, carId, callback)` - Get specific car (requires inventory:read)
- `getInventoryStats(user, callback)` - Get statistics (requires inventory:read)
- `addCar(user, carData, callback)` - Add car (requires inventory:create)
- `updateCar(user, carId, updates, callback)` - Update car (requires inventory:update)
- `deleteCar(user, carId, callback)` - Delete car (requires inventory:delete)
- `searchCarsByModel(user, model, callback)` - Search cars (requires inventory:read)
- `getCarsByStatus(user, status, callback)` - Filter cars (requires inventory:read)

**Features:**
- All operations check permissions via authorization middleware
- All operations are logged via adminLogger
- Failed permission checks are logged as ACCESS_DENIED
- Uses Node.js callback pattern for async operations

**Critical:** The `deleteCar` function explicitly checks for `inventory:delete` permission, which managers do not have.

**Dependencies:** Car model, authorization middleware, adminLogger

#### `adminLogController.js`
**Purpose:** Handle admin log operations with RBAC

**Exports:**
- `getLogs(user, [filters,] callback)` - Get logs (requires logs:read)
- `getLogById(user, logId, callback)` - Get specific log (requires logs:read)
- `getLogCount(user, callback)` - Get log count (requires logs:read)
- `clearLogs(user, callback)` - Clear all logs (requires logs:manage)
- `getLogsByUser(user, targetUserId, callback)` - Filter logs by user (requires logs:read)
- `getLogsByType(user, logType, callback)` - Filter logs by type (requires logs:read)
- `getInventoryLogs(user, callback)` - Get inventory-related logs (requires logs:read)
- `getAccessDeniedLogs(user, callback)` - Get access denied logs (requires logs:read)

**Features:**
- Managers can read logs but cannot clear them
- Employees cannot access logs at all
- Flexible filtering options
- Callback pattern for consistency

**Dependencies:** adminLogger utility, authorization middleware

---

### 4. Middleware (`src/middleware/`)

#### `authorization.js`
**Purpose:** Provide RBAC middleware functions

**Exports:**
- `requirePermission(permission)` - Generic permission checker factory
- `canReadInventory(user, callback)` - Check inventory:read permission
- `canCreateInventory(user, callback)` - Check inventory:create permission
- `canUpdateInventory(user, callback)` - Check inventory:update permission
- `canDeleteInventory(user, callback)` - Check inventory:delete permission
- `canReadLogs(user, callback)` - Check logs:read permission
- `canManageLogs(user, callback)` - Check logs:manage permission
- `isAdmin(user)` - Check if user is admin (returns boolean)
- `isManager(user)` - Check if user is manager (returns boolean)
- `isEmployee(user)` - Check if user is employee (returns boolean)

**Error Codes:**
- `UNAUTHORIZED` - No user provided
- `FORBIDDEN` - User lacks required permission

**Features:**
- Logs all access denied attempts
- Uses callback pattern for async operations
- Provides both permission-based and role-based checks

**Dependencies:** roles config, adminLogger

---

### 5. Utilities (`src/utils/`)

#### `adminLogger.js`
**Purpose:** Comprehensive audit logging system

**Data Structure:**
```javascript
{
  id: 'LOG-1234567890-abc123',
  timestamp: '2024-01-01T00:00:00.000Z',
  type: 'CREATE',
  userId: 'USER-1',
  userRole: 'admin',
  resource: 'inventory',
  resourceId: 'CAR-1',
  action: 'CREATE operation on inventory',
  details: { carInfo: {...} },
  success: true
}
```

**Exports:**
- `LOG_TYPES` - Object containing log type constants
  - CREATE, UPDATE, DELETE, READ, LOGIN, LOGOUT, ACCESS_DENIED

- `createLogEntry(options)` - Create a new log entry
- `getLogs([filters])` - Get all logs with optional filtering
- `getLogById(logId)` - Get specific log entry
- `clearLogs()` - Clear all logs (admin only)
- `logInventoryOperation(type, user, car, details, success)` - Log inventory operations
- `logAccessDenied(user, resource, action)` - Log access denied events
- `getLogCount()` - Get total log count

**Features:**
- Dual storage: in-memory + file persistence
- Flexible filtering (type, userId, resource, date range)
- Automatic timestamp and ID generation
- Non-blocking file writes

**Storage:**
- In-memory: Array (fast access)
- Persistent: `logs/admin.log` (JSON lines format)

**Dependencies:** fs, path (Node.js built-ins)

---

### 6. Assets (`src/assets/`)

#### `logo.js`
**Purpose:** Display Toyota branding

**Exports:**
- `displayLogo()` - Display ASCII art Toyota logo and system banner

**Features:**
- ASCII art logo
- System version information
- Console-based display

---

### 7. Entry Point (`src/`)

#### `index.js`
**Purpose:** Main application entry point and demo

**Exports:**
All major modules for external use:
- `initializeSystem()`
- `demonstrateRBAC()`
- `demonstrateInventoryOperations(admin, manager, employee)`
- `demonstrateAdminLogging(admin, manager, employee)`
- `ROLES`, `User`, `Car`, `inventoryController`, `adminLogController`

**Features:**
- Initializes system with sample data
- Demonstrates all RBAC features
- Shows permission enforcement
- Displays admin logging capabilities
- Can be used as a module or run directly

**Usage:**
```bash
npm start  # Run the demo
```

---

## Module Dependencies Graph

```
index.js
  ├── config/roles.js
  ├── models/User.js
  │   └── config/roles.js
  ├── models/Car.js
  ├── controllers/inventoryController.js
  │   ├── models/Car.js
  │   ├── middleware/authorization.js
  │   │   ├── config/roles.js
  │   │   └── utils/adminLogger.js
  │   └── utils/adminLogger.js
  ├── controllers/adminLogController.js
  │   ├── utils/adminLogger.js
  │   └── middleware/authorization.js
  ├── middleware/authorization.js
  └── assets/logo.js
```

## Data Flow

### Example: Manager Attempts to Delete Car

```
1. User calls inventoryController.deleteCar(manager, 'CAR-1', callback)
2. Controller calls canDeleteInventory(manager, callback)
3. Middleware checks hasPermission(manager.role, 'inventory:delete')
4. Permission check FAILS (manager doesn't have inventory:delete)
5. Middleware logs access denied via logAccessDenied(manager, 'inventory', 'delete car CAR-1')
6. Middleware calls callback with FORBIDDEN error
7. Controller receives error and passes it to user's callback
8. User receives error: "Permission denied. Required permission: inventory:delete"
```

### Example: Admin Successfully Deletes Car

```
1. User calls inventoryController.deleteCar(admin, 'CAR-1', callback)
2. Controller calls canDeleteInventory(admin, callback)
3. Middleware checks hasPermission(admin.role, 'inventory:delete')
4. Permission check PASSES (admin has inventory:delete)
5. Middleware calls callback with success
6. Controller calls Car.deleteCar('CAR-1')
7. Car model removes car and returns deleted car object
8. Controller logs operation via logInventoryOperation(DELETE, admin, car, ...)
9. Controller calls user's callback with deleted car
10. User receives deleted car object
```

## Testing

### Test Files

1. **`tests/roles.test.js`** (39 tests)
   - RBAC configuration tests
   - Permission verification for all roles
   - Critical test: Manager cannot delete

2. **`tests/inventoryController.test.js`** (14 tests)
   - Controller operations with different roles
   - Permission enforcement
   - Error handling

3. **`tests/adminLogger.test.js`** (8 tests)
   - Log creation and retrieval
   - Filtering functionality
   - Access denied logging

### Custom Verification

**`verify-modules.js`** (86 tests)
- Module loading and exports
- RBAC implementation
- Data model validation
- Controller integration
- Complete system verification

Run with: `npm run verify`

## Common Patterns

### Callback Pattern

All async operations use Node.js-style callbacks:

```javascript
functionName(user, ...args, (err, result) => {
  if (err) {
    // Handle error
    console.error(err.message);
  } else {
    // Use result
    console.log(result);
  }
});
```

### Permission Checking

```javascript
// In controller
canDoSomething(user, (err) => {
  if (err) {
    return callback(err);  // Access denied
  }
  // Proceed with operation
  const result = performOperation();
  callback(null, result);
});
```

### Logging

```javascript
// Log successful operation
logInventoryOperation(LOG_TYPES.CREATE, user, car, {
  action: 'Added new car'
});

// Log access denied
logAccessDenied(user, 'inventory', 'delete car');
```

## Security Considerations

### ✅ Implemented

- Role-based access control at controller level
- Permission checking before all operations
- Audit logging of all operations
- Access denied event logging
- Role validation at user creation
- VIN uniqueness enforcement
- No hardcoded credentials

### 🔍 Future Enhancements

- Database encryption at rest
- JWT token authentication
- Password hashing (bcrypt)
- Input sanitization for XSS
- Rate limiting
- HTTPS enforcement
- Session management
- CSRF protection

## Performance Considerations

### Current Implementation (In-Memory)

- **Pros:** Fast, simple, no external dependencies
- **Cons:** Data lost on restart, limited scalability
- **Use Case:** Demo, development, small deployments

### Production Recommendations

1. **Database:** Use PostgreSQL or MongoDB
2. **Caching:** Add Redis for frequently accessed data
3. **Connection Pooling:** For database connections
4. **Indexing:** Index VIN, user IDs, timestamps
5. **Pagination:** For large result sets

## Module Best Practices

1. **Single Responsibility:** Each module has one clear purpose
2. **Consistent Exports:** All modules export functions/objects via module.exports
3. **Documentation:** JSDoc comments on all public functions
4. **Error Handling:** Consistent error codes and messages
5. **Logging:** All operations are logged for audit trail
6. **Testing:** Comprehensive test coverage
7. **Separation of Concerns:** Clear boundaries between layers

---

**Last Updated:** 2025-12-11  
**Version:** 1.0.0
