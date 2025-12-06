/**
 * Tests for Inventory Controller with Role-Based Access Control
 */

const inventoryController = require('../src/controllers/inventoryController');
const Car = require('../src/models/Car');
const User = require('../src/models/User');
const { ROLES } = require('../src/config/roles');

describe('Inventory Controller', () => {
  let adminUser, managerUser, employeeUser;

  beforeEach(() => {
    // Clear and reinitialize data
    User.clearUsers();
    Car.clearCars();

    // Create test users
    adminUser = User.createUser({
      username: 'testadmin',
      email: 'admin@test.com',
      role: ROLES.ADMIN,
      name: 'Test Admin'
    });

    managerUser = User.createUser({
      username: 'testmanager',
      email: 'manager@test.com',
      role: ROLES.MANAGER,
      name: 'Test Manager'
    });

    employeeUser = User.createUser({
      username: 'testemployee',
      email: 'employee@test.com',
      role: ROLES.EMPLOYEE,
      name: 'Test Employee'
    });

    // Create a test car
    Car.createCar({
      vin: 'TESTVINSAMPLE123',
      model: 'Toyota Test',
      year: 2024,
      color: 'Test Color',
      price: 30000
    });
  });

  describe('getAllCars', () => {
    test('admin can read all cars', (done) => {
      inventoryController.getAllCars(adminUser, (err, cars) => {
        expect(err).toBeNull();
        expect(cars).toBeDefined();
        expect(cars.length).toBeGreaterThan(0);
        done();
      });
    });

    test('manager can read all cars', (done) => {
      inventoryController.getAllCars(managerUser, (err, cars) => {
        expect(err).toBeNull();
        expect(cars).toBeDefined();
        expect(cars.length).toBeGreaterThan(0);
        done();
      });
    });

    test('employee can read all cars', (done) => {
      inventoryController.getAllCars(employeeUser, (err, cars) => {
        expect(err).toBeNull();
        expect(cars).toBeDefined();
        expect(cars.length).toBeGreaterThan(0);
        done();
      });
    });

    test('unauthenticated user cannot read cars', (done) => {
      inventoryController.getAllCars(null, (err, cars) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('UNAUTHORIZED');
        done();
      });
    });
  });

  describe('addCar', () => {
    const newCarData = {
      vin: 'NEWTESTVINSAMPLE',
      model: 'Toyota New',
      year: 2024,
      color: 'Blue',
      price: 35000
    };

    test('admin can add a car', (done) => {
      inventoryController.addCar(adminUser, newCarData, (err, car) => {
        expect(err).toBeNull();
        expect(car).toBeDefined();
        expect(car.model).toBe('Toyota New');
        done();
      });
    });

    test('manager can add a car', (done) => {
      const managerCarData = { ...newCarData, vin: 'MANAGERVINSAMPLE' };
      inventoryController.addCar(managerUser, managerCarData, (err, car) => {
        expect(err).toBeNull();
        expect(car).toBeDefined();
        expect(car.model).toBe('Toyota New');
        done();
      });
    });

    test('employee cannot add a car', (done) => {
      const employeeCarData = { ...newCarData, vin: 'EMPLOYEEVINSAMPLE' };
      inventoryController.addCar(employeeUser, employeeCarData, (err, car) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('FORBIDDEN');
        done();
      });
    });
  });

  describe('updateCar', () => {
    test('admin can update a car', (done) => {
      const car = Car.getAllCars()[0];
      inventoryController.updateCar(adminUser, car.id, { color: 'Updated Color' }, (err, updatedCar) => {
        expect(err).toBeNull();
        expect(updatedCar.color).toBe('Updated Color');
        done();
      });
    });

    test('manager can update a car', (done) => {
      const car = Car.getAllCars()[0];
      inventoryController.updateCar(managerUser, car.id, { color: 'Manager Color' }, (err, updatedCar) => {
        expect(err).toBeNull();
        expect(updatedCar.color).toBe('Manager Color');
        done();
      });
    });

    test('employee cannot update a car', (done) => {
      const car = Car.getAllCars()[0];
      inventoryController.updateCar(employeeUser, car.id, { color: 'Employee Color' }, (err, updatedCar) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('FORBIDDEN');
        done();
      });
    });
  });

  describe('deleteCar - CRITICAL TEST: Manager Cannot Delete', () => {
    test('admin can delete a car', (done) => {
      const car = Car.getAllCars()[0];
      inventoryController.deleteCar(adminUser, car.id, (err, deletedCar) => {
        expect(err).toBeNull();
        expect(deletedCar).toBeDefined();
        expect(deletedCar.id).toBe(car.id);
        done();
      });
    });

    test('CRITICAL: manager CANNOT delete a car', (done) => {
      // Re-add a car since it might have been deleted
      Car.createCar({
        vin: 'DELETETESTVINSAM',
        model: 'Toyota Delete Test',
        year: 2024,
        color: 'Red',
        price: 40000
      });
      
      const car = Car.getAllCars()[0];
      inventoryController.deleteCar(managerUser, car.id, (err, deletedCar) => {
        // Manager should be DENIED from deleting
        expect(err).toBeDefined();
        expect(err.code).toBe('FORBIDDEN');
        expect(err.message).toContain('Permission denied');
        done();
      });
    });

    test('employee cannot delete a car', (done) => {
      const car = Car.getAllCars()[0];
      inventoryController.deleteCar(employeeUser, car.id, (err, deletedCar) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('FORBIDDEN');
        done();
      });
    });
  });

  describe('getInventoryStats', () => {
    test('admin can get inventory stats', (done) => {
      inventoryController.getInventoryStats(adminUser, (err, stats) => {
        expect(err).toBeNull();
        expect(stats).toBeDefined();
        expect(stats.total).toBeGreaterThanOrEqual(0);
        done();
      });
    });

    test('manager can get inventory stats', (done) => {
      inventoryController.getInventoryStats(managerUser, (err, stats) => {
        expect(err).toBeNull();
        expect(stats).toBeDefined();
        done();
      });
    });

    test('employee can get inventory stats', (done) => {
      inventoryController.getInventoryStats(employeeUser, (err, stats) => {
        expect(err).toBeNull();
        expect(stats).toBeDefined();
        done();
      });
    });
  });
});
