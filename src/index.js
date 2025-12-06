/**
 * Toyota Inventory Management System
 * 
 * Main entry point for the inventory system with role-based access control
 */

const { ROLES, hasPermission, getPermissions } = require('./config/roles');
const User = require('./models/User');
const Car = require('./models/Car');
const inventoryController = require('./controllers/inventoryController');
const adminLogController = require('./controllers/adminLogController');
const { isAdmin, isManager, isEmployee } = require('./middleware/authorization');
const { displayLogo } = require('./assets/logo');

/**
 * Initialize the system with sample data
 */
function initializeSystem() {
  // Display Toyota logo
  displayLogo();
  
  console.log('='.repeat(60));
  console.log('Initializing system with sample data...\n');

  // Initialize users and cars
  User.initializeDefaultUsers();
  Car.initializeSampleCars();

  console.log('Default users created:');
  User.getAllUsers().forEach(user => {
    console.log(`  - ${user.name} (${user.username}) - Role: ${user.role}`);
  });

  console.log('\nSample cars added:');
  Car.getAllCars().forEach(car => {
    console.log(`  - ${car.model} (${car.year}) - Status: ${car.status}`);
  });

  return {
    users: User.getAllUsers(),
    cars: Car.getAllCars()
  };
}

/**
 * Demonstrate the role-based access control system
 */
function demonstrateRBAC() {
  console.log('\n' + '='.repeat(60));
  console.log('Demonstrating Role-Based Access Control');
  console.log('='.repeat(60));

  // Get all users
  const admin = User.getUserByUsername('admin');
  const manager = User.getUserByUsername('gerente');
  const employee = User.getUserByUsername('empleado');

  console.log('\n--- Admin Permissions ---');
  console.log(`User: ${admin.name}`);
  console.log('Permissions:', getPermissions(admin.role));

  console.log('\n--- Manager Permissions ---');
  console.log(`User: ${manager.name}`);
  console.log('Permissions:', getPermissions(manager.role));
  console.log('Note: Managers CANNOT delete cars (no inventory:delete permission)');

  console.log('\n--- Employee Permissions ---');
  console.log(`User: ${employee.name}`);
  console.log('Permissions:', getPermissions(employee.role));
  console.log('Note: Employees have limited read-only access');

  return { admin, manager, employee };
}

/**
 * Demonstrate inventory operations with different roles
 */
function demonstrateInventoryOperations(admin, manager, employee) {
  console.log('\n' + '='.repeat(60));
  console.log('Demonstrating Inventory Operations');
  console.log('='.repeat(60));

  // Test 1: All roles can read inventory
  console.log('\n--- Test 1: Reading Inventory ---');
  
  inventoryController.getAllCars(admin, (err, cars) => {
    if (err) {
      console.log(`Admin read: DENIED - ${err.message}`);
    } else {
      console.log(`Admin read: SUCCESS - Found ${cars.length} cars`);
    }
  });

  inventoryController.getAllCars(manager, (err, cars) => {
    if (err) {
      console.log(`Manager read: DENIED - ${err.message}`);
    } else {
      console.log(`Manager read: SUCCESS - Found ${cars.length} cars`);
    }
  });

  inventoryController.getAllCars(employee, (err, cars) => {
    if (err) {
      console.log(`Employee read: DENIED - ${err.message}`);
    } else {
      console.log(`Employee read: SUCCESS - Found ${cars.length} cars`);
    }
  });

  // Test 2: Adding cars
  console.log('\n--- Test 2: Adding Cars to Inventory ---');
  
  const newCarData = {
    vin: 'JTDKN3DU0A0999999',
    model: 'Toyota Supra',
    year: 2024,
    color: 'Red',
    price: 55000
  };

  inventoryController.addCar(manager, newCarData, (err, car) => {
    if (err) {
      console.log(`Manager add car: DENIED - ${err.message}`);
    } else {
      console.log(`Manager add car: SUCCESS - Added ${car.model}`);
    }
  });

  inventoryController.addCar(employee, { ...newCarData, vin: 'JTDKN3DU0A0888888' }, (err, car) => {
    if (err) {
      console.log(`Employee add car: DENIED - ${err.message}`);
    } else {
      console.log(`Employee add car: SUCCESS - Added ${car.model}`);
    }
  });

  // Test 3: Deleting cars - THIS SHOULD FAIL FOR MANAGER
  console.log('\n--- Test 3: Deleting Cars (Manager should be DENIED) ---');
  
  const carToDelete = Car.getAllCars()[0];
  
  inventoryController.deleteCar(admin, carToDelete.id, (err, car) => {
    if (err) {
      console.log(`Admin delete: DENIED - ${err.message}`);
    } else {
      console.log(`Admin delete: SUCCESS - Deleted ${car.model}`);
    }
  });

  // Re-add a car for manager delete test
  const anotherCar = Car.getAllCars()[0];
  
  inventoryController.deleteCar(manager, anotherCar.id, (err, car) => {
    if (err) {
      console.log(`Manager delete: DENIED - ${err.message}`);
    } else {
      console.log(`Manager delete: SUCCESS - Deleted ${car.model}`);
    }
  });

  inventoryController.deleteCar(employee, anotherCar.id, (err, car) => {
    if (err) {
      console.log(`Employee delete: DENIED - ${err.message}`);
    } else {
      console.log(`Employee delete: SUCCESS - Deleted ${car.model}`);
    }
  });
}

/**
 * Demonstrate admin logging functionality
 */
function demonstrateAdminLogging(admin, manager, employee) {
  console.log('\n' + '='.repeat(60));
  console.log('Demonstrating Admin Logging');
  console.log('='.repeat(60));

  // Admin can view logs
  console.log('\n--- Viewing Logs ---');
  
  adminLogController.getLogs(admin, (err, logs) => {
    if (err) {
      console.log(`Admin view logs: DENIED - ${err.message}`);
    } else {
      console.log(`Admin view logs: SUCCESS - Found ${logs.length} log entries`);
      console.log('\nSample log entries:');
      logs.slice(0, 3).forEach(log => {
        console.log(`  - [${log.type}] ${log.action} by ${log.userRole} (${log.userId})`);
      });
    }
  });

  // Manager can also view logs
  adminLogController.getLogs(manager, (err, logs) => {
    if (err) {
      console.log(`Manager view logs: DENIED - ${err.message}`);
    } else {
      console.log(`\nManager view logs: SUCCESS - Found ${logs.length} log entries`);
    }
  });

  // Employee cannot view logs
  adminLogController.getLogs(employee, (err, logs) => {
    if (err) {
      console.log(`Employee view logs: DENIED - ${err.message}`);
    } else {
      console.log(`Employee view logs: SUCCESS - Found ${logs.length} log entries`);
    }
  });

  // Access denied logs
  console.log('\n--- Access Denied Attempts ---');
  adminLogController.getAccessDeniedLogs(admin, (err, logs) => {
    if (err) {
      console.log('Could not retrieve access denied logs');
    } else {
      console.log(`Found ${logs.length} access denied attempts:`);
      logs.forEach(log => {
        console.log(`  - User: ${log.userId} (${log.userRole}) tried to ${log.action}`);
      });
    }
  });
}

/**
 * Main function to run the demo
 */
function main() {
  // Initialize the system
  initializeSystem();

  // Demonstrate RBAC
  const { admin, manager, employee } = demonstrateRBAC();

  // Demonstrate inventory operations
  demonstrateInventoryOperations(admin, manager, employee);

  // Demonstrate admin logging
  demonstrateAdminLogging(admin, manager, employee);

  console.log('\n' + '='.repeat(60));
  console.log('Demo Complete');
  console.log('='.repeat(60));
  console.log('\nKey Points:');
  console.log('1. Admin has FULL access to all operations');
  console.log('2. Manager can read, create, and update inventory but CANNOT DELETE cars');
  console.log('3. Employee has LIMITED read-only access');
  console.log('4. All operations are logged for admin audit trail');
  console.log('5. Access denied attempts are also logged');
}

// Export for use as a module
module.exports = {
  initializeSystem,
  demonstrateRBAC,
  demonstrateInventoryOperations,
  demonstrateAdminLogging,
  ROLES,
  User,
  Car,
  inventoryController,
  adminLogController
};

// Run if executed directly
if (require.main === module) {
  main();
}
