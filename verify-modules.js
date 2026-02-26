#!/usr/bin/env node
/**
 * Module Verification Script
 * 
 * This script verifies the integrity and correctness of all modules in the project
 */

const fs = require('fs');
const path = require('path');

// Import all modules to verify they load correctly
const { ROLES, hasPermission, getPermissions, isValidRole } = require('./src/config/roles');
const User = require('./src/models/User');
const Car = require('./src/models/Car');
const inventoryController = require('./src/controllers/inventoryController');
const adminLogController = require('./src/controllers/adminLogController');
const authorization = require('./src/middleware/authorization');
const adminLogger = require('./src/utils/adminLogger');
const { displayLogo } = require('./src/assets/logo');

console.log('='.repeat(70));
console.log('MODULE VERIFICATION SCRIPT');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;
const issues = [];

/**
 * Test helper function
 */
function test(description, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    issues.push({ test: description, error: error.message });
    failed++;
  }
}

/**
 * Verify a module exists and exports expected functions
 */
function verifyModule(moduleName, moduleObj, expectedExports) {
  test(`Module ${moduleName} loads correctly`, () => {
    if (!moduleObj) throw new Error('Module is undefined');
  });

  expectedExports.forEach(exportName => {
    test(`Module ${moduleName} exports ${exportName}`, () => {
      if (!(exportName in moduleObj)) {
        throw new Error(`Missing export: ${exportName}`);
      }
    });
  });
}

console.log('\n--- Verifying Module Exports ---\n');

// Verify roles module
verifyModule('config/roles', { ROLES, hasPermission, getPermissions, isValidRole }, 
  ['ROLES', 'hasPermission', 'getPermissions', 'isValidRole']);

// Verify User model
verifyModule('models/User', User, 
  ['createUser', 'getUserById', 'getUserByUsername', 'getAllUsers', 
   'getUsersByRole', 'updateUser', 'deleteUser', 'clearUsers', 'initializeDefaultUsers']);

// Verify Car model
verifyModule('models/Car', Car, 
  ['CAR_STATUS', 'createCar', 'getCarById', 'getCarByVin', 'getAllCars', 
   'getCarsByStatus', 'getCarsByModel', 'updateCar', 'deleteCar', 
   'clearCars', 'getInventoryStats', 'initializeSampleCars']);

// Verify inventory controller
verifyModule('controllers/inventoryController', inventoryController, 
  ['getAllCars', 'getCarById', 'getInventoryStats', 'addCar', 
   'updateCar', 'deleteCar', 'searchCarsByModel', 'getCarsByStatus']);

// Verify admin log controller
verifyModule('controllers/adminLogController', adminLogController, 
  ['getLogs', 'getLogById', 'getLogCount', 'clearLogs', 
   'getLogsByUser', 'getLogsByType', 'getInventoryLogs', 'getAccessDeniedLogs']);

// Verify authorization middleware
verifyModule('middleware/authorization', authorization, 
  ['requirePermission', 'canReadInventory', 'canCreateInventory', 
   'canUpdateInventory', 'canDeleteInventory', 'canReadLogs', 
   'canManageLogs', 'isAdmin', 'isManager', 'isEmployee']);

// Verify admin logger
verifyModule('utils/adminLogger', adminLogger, 
  ['LOG_TYPES', 'createLogEntry', 'getLogs', 'getLogById', 
   'clearLogs', 'logInventoryOperation', 'logAccessDenied', 'getLogCount']);

console.log('\n--- Verifying Role-Based Access Control ---\n');

// Test RBAC permissions
test('Admin has all permissions', () => {
  const adminPerms = getPermissions(ROLES.ADMIN);
  const required = ['inventory:read', 'inventory:create', 'inventory:update', 
                    'inventory:delete', 'logs:read', 'logs:manage'];
  required.forEach(perm => {
    if (!adminPerms.includes(perm)) {
      throw new Error(`Admin missing permission: ${perm}`);
    }
  });
});

test('Manager cannot delete inventory', () => {
  if (hasPermission(ROLES.MANAGER, 'inventory:delete')) {
    throw new Error('Manager should NOT have inventory:delete permission');
  }
});

test('Manager can create and update inventory', () => {
  if (!hasPermission(ROLES.MANAGER, 'inventory:create')) {
    throw new Error('Manager should have inventory:create permission');
  }
  if (!hasPermission(ROLES.MANAGER, 'inventory:update')) {
    throw new Error('Manager should have inventory:update permission');
  }
});

test('Employee has limited read-only access', () => {
  if (!hasPermission(ROLES.EMPLOYEE, 'inventory:read')) {
    throw new Error('Employee should have inventory:read permission');
  }
  if (hasPermission(ROLES.EMPLOYEE, 'inventory:create')) {
    throw new Error('Employee should NOT have inventory:create permission');
  }
  if (hasPermission(ROLES.EMPLOYEE, 'logs:read')) {
    throw new Error('Employee should NOT have logs:read permission');
  }
});

console.log('\n--- Verifying Data Models ---\n');

// Clear existing data
User.clearUsers();
Car.clearCars();
adminLogger.clearLogs();

// Test User model
test('Can create a user', () => {
  const user = User.createUser({
    username: 'testuser',
    email: 'test@test.com',
    role: ROLES.ADMIN,
    name: 'Test User'
  });
  if (!user.id || !user.username) throw new Error('User creation failed');
});

test('Cannot create user with invalid role', () => {
  try {
    User.createUser({
      username: 'baduser',
      email: 'bad@test.com',
      role: 'invalid_role',
      name: 'Bad User'
    });
    throw new Error('Should have thrown error for invalid role');
  } catch (error) {
    if (!error.message.includes('Invalid role')) {
      throw error;
    }
  }
});

test('Can retrieve user by username', () => {
  const user = User.getUserByUsername('testuser');
  if (!user || user.username !== 'testuser') {
    throw new Error('Failed to retrieve user by username');
  }
});

// Test Car model
test('Can create a car', () => {
  const car = Car.createCar({
    vin: 'TEST123456789',
    model: 'Test Model',
    year: 2024,
    color: 'Blue',
    price: 30000
  });
  if (!car.id || !car.vin) throw new Error('Car creation failed');
});

test('Cannot create car with duplicate VIN', () => {
  try {
    Car.createCar({
      vin: 'TEST123456789',
      model: 'Duplicate',
      year: 2024,
      color: 'Red',
      price: 25000
    });
    throw new Error('Should have thrown error for duplicate VIN');
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
});

test('Can get inventory statistics', () => {
  const stats = Car.getInventoryStats();
  if (stats.total !== 1) throw new Error('Inventory stats incorrect');
});

console.log('\n--- Verifying Controllers with RBAC ---\n');

// Create test users
const admin = User.createUser({
  username: 'admin',
  email: 'admin@test.com',
  role: ROLES.ADMIN,
  name: 'Admin User'
});

const manager = User.createUser({
  username: 'manager',
  email: 'manager@test.com',
  role: ROLES.MANAGER,
  name: 'Manager User'
});

const employee = User.createUser({
  username: 'employee',
  email: 'employee@test.com',
  role: ROLES.EMPLOYEE,
  name: 'Employee User'
});

// Test inventory controller with RBAC
// Note: These callbacks execute synchronously in our implementation
test('Admin can add a car', () => {
  let testError = null;
  inventoryController.addCar(admin, {
    vin: 'ADMIN_CAR_123',
    model: 'Admin Car',
    year: 2024,
    color: 'Black',
    price: 40000
  }, (err, car) => {
    if (err) testError = err;
    if (!car || !car.id) testError = new Error('Failed to add car');
  });
  if (testError) throw testError;
});

test('Manager can add a car', () => {
  let testError = null;
  inventoryController.addCar(manager, {
    vin: 'MANAGER_CAR_123',
    model: 'Manager Car',
    year: 2024,
    color: 'White',
    price: 35000
  }, (err, car) => {
    if (err) testError = err;
    if (!car || !car.id) testError = new Error('Failed to add car');
  });
  if (testError) throw testError;
});

test('Employee cannot add a car', () => {
  let testError = null;
  let callbackExecuted = false;
  inventoryController.addCar(employee, {
    vin: 'EMPLOYEE_CAR_123',
    model: 'Employee Car',
    year: 2024,
    color: 'Green',
    price: 30000
  }, (err, car) => {
    callbackExecuted = true;
    if (!err) testError = new Error('Employee should not be able to add cars');
    else if (err.code !== 'FORBIDDEN') testError = new Error('Wrong error code');
  });
  if (!callbackExecuted) throw new Error('Callback was not executed');
  if (testError) throw testError;
});

test('Manager CANNOT delete a car (critical test)', () => {
  const cars = Car.getAllCars();
  if (cars.length === 0) throw new Error('No cars to test delete');
  
  let testError = null;
  let callbackExecuted = false;
  inventoryController.deleteCar(manager, cars[0].id, (err, deletedCar) => {
    callbackExecuted = true;
    if (!err) testError = new Error('Manager should NOT be able to delete cars');
    else if (err.code !== 'FORBIDDEN') testError = new Error('Wrong error code');
  });
  if (!callbackExecuted) throw new Error('Callback was not executed');
  if (testError) throw testError;
});

test('Admin CAN delete a car', () => {
  const cars = Car.getAllCars();
  if (cars.length === 0) throw new Error('No cars to test delete');
  
  let testError = null;
  inventoryController.deleteCar(admin, cars[0].id, (err, deletedCar) => {
    if (err) testError = err;
    if (!deletedCar) testError = new Error('Failed to delete car');
  });
  if (testError) throw testError;
});

console.log('\n--- Verifying Admin Logging ---\n');

test('Admin can view logs', () => {
  let testError = null;
  adminLogController.getLogs(admin, (err, logs) => {
    if (err) testError = err;
    if (!Array.isArray(logs)) testError = new Error('Logs should be an array');
  });
  if (testError) throw testError;
});

test('Manager can view logs', () => {
  let testError = null;
  adminLogController.getLogs(manager, (err, logs) => {
    if (err) testError = err;
    if (!Array.isArray(logs)) testError = new Error('Logs should be an array');
  });
  if (testError) throw testError;
});

test('Employee cannot view logs', () => {
  let testError = null;
  let callbackExecuted = false;
  adminLogController.getLogs(employee, (err, logs) => {
    callbackExecuted = true;
    if (!err) testError = new Error('Employee should not be able to view logs');
    else if (err.code !== 'FORBIDDEN') testError = new Error('Wrong error code');
  });
  if (!callbackExecuted) throw new Error('Callback was not executed');
  if (testError) throw testError;
});

test('Only admin can clear logs', () => {
  let testError = null;
  let callbackExecuted = false;
  adminLogController.clearLogs(manager, (err, result) => {
    callbackExecuted = true;
    if (!err) testError = new Error('Manager should not be able to clear logs');
    else if (err.code !== 'FORBIDDEN') testError = new Error('Wrong error code');
  });
  if (!callbackExecuted) throw new Error('Callback was not executed');
  if (testError) throw testError;
});

test('Logs contain access denied entries', () => {
  const logs = adminLogger.getLogs({ type: adminLogger.LOG_TYPES.ACCESS_DENIED });
  if (logs.length === 0) {
    throw new Error('Should have access denied log entries');
  }
});

console.log('\n' + '='.repeat(70));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n--- Issues Found ---');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.test}`);
    console.log(`   ${issue.error}`);
  });
  console.log('\n⚠️  Some verification tests failed. Please review the issues above.');
  process.exit(1);
} else {
  console.log('\n✅ All modules verified successfully!');
  console.log('\nKey Verification Points:');
  console.log('  ✓ All modules load correctly');
  console.log('  ✓ All expected exports are present');
  console.log('  ✓ Role-Based Access Control is properly configured');
  console.log('  ✓ Manager CANNOT delete cars (critical requirement)');
  console.log('  ✓ Data models enforce validation rules');
  console.log('  ✓ Admin logging is functional');
  console.log('  ✓ Access denied events are logged');
  process.exit(0);
}
