/**
 * Inventory Controller
 * 
 * Handles inventory operations with role-based access control and logging
 */

const Car = require('../models/Car');
const {
  canReadInventory,
  canCreateInventory,
  canUpdateInventory,
  canDeleteInventory
} = require('../middleware/authorization');
const { LOG_TYPES, logInventoryOperation, logAccessDenied } = require('../utils/adminLogger');

/**
 * Get all cars in inventory
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, cars)
 */
function getAllCars(user, callback) {
  canReadInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    const cars = Car.getAllCars();
    
    // Log the read operation
    logInventoryOperation(LOG_TYPES.READ, user, null, {
      action: 'View all inventory',
      count: cars.length
    });

    return callback(null, cars);
  });
}

/**
 * Get a specific car by ID
 * @param {Object} user - User performing the action
 * @param {string} carId - Car ID
 * @param {Function} callback - Callback function (err, car)
 */
function getCarById(user, carId, callback) {
  canReadInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    const car = Car.getCarById(carId);
    if (!car) {
      const error = new Error(`Car with ID ${carId} not found`);
      error.code = 'NOT_FOUND';
      return callback(error);
    }

    // Log the read operation
    logInventoryOperation(LOG_TYPES.READ, user, car, {
      action: 'View car details'
    });

    return callback(null, car);
  });
}

/**
 * Get inventory statistics
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, stats)
 */
function getInventoryStats(user, callback) {
  canReadInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    const stats = Car.getInventoryStats();
    
    // Log the read operation
    logInventoryOperation(LOG_TYPES.READ, user, null, {
      action: 'View inventory statistics'
    });

    return callback(null, stats);
  });
}

/**
 * Add a new car to inventory
 * @param {Object} user - User performing the action
 * @param {Object} carData - Car data
 * @param {Function} callback - Callback function (err, car)
 */
function addCar(user, carData, callback) {
  canCreateInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    try {
      const car = Car.createCar(carData);
      
      // Log the create operation
      logInventoryOperation(LOG_TYPES.CREATE, user, car, {
        action: 'Add new car to inventory'
      });

      return callback(null, car);
    } catch (error) {
      return callback(error);
    }
  });
}

/**
 * Update a car in inventory
 * @param {Object} user - User performing the action
 * @param {string} carId - Car ID
 * @param {Object} updates - Updates to apply
 * @param {Function} callback - Callback function (err, car)
 */
function updateCar(user, carId, updates, callback) {
  canUpdateInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    try {
      const originalCar = Car.getCarById(carId);
      if (!originalCar) {
        const error = new Error(`Car with ID ${carId} not found`);
        error.code = 'NOT_FOUND';
        return callback(error);
      }

      const updatedCar = Car.updateCar(carId, updates);
      
      // Log the update operation
      logInventoryOperation(LOG_TYPES.UPDATE, user, updatedCar, {
        action: 'Update car information',
        previousValues: originalCar,
        newValues: updates
      });

      return callback(null, updatedCar);
    } catch (error) {
      return callback(error);
    }
  });
}

/**
 * Delete a car from inventory
 * Only admins can delete cars - managers cannot delete!
 * @param {Object} user - User performing the action
 * @param {string} carId - Car ID
 * @param {Function} callback - Callback function (err, deletedCar)
 */
function deleteCar(user, carId, callback) {
  canDeleteInventory(user, (err) => {
    if (err) {
      // Log the access denied for delete attempt
      logAccessDenied(user, 'inventory', `delete car ${carId}`);
      return callback(err);
    }

    const car = Car.getCarById(carId);
    if (!car) {
      const error = new Error(`Car with ID ${carId} not found`);
      error.code = 'NOT_FOUND';
      return callback(error);
    }

    const deletedCar = Car.deleteCar(carId);
    
    // Log the delete operation
    logInventoryOperation(LOG_TYPES.DELETE, user, deletedCar, {
      action: 'Delete car from inventory'
    });

    return callback(null, deletedCar);
  });
}

/**
 * Search cars by model
 * @param {Object} user - User performing the action
 * @param {string} model - Model to search for
 * @param {Function} callback - Callback function (err, cars)
 */
function searchCarsByModel(user, model, callback) {
  canReadInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    const cars = Car.getCarsByModel(model);
    
    // Log the search operation
    logInventoryOperation(LOG_TYPES.READ, user, null, {
      action: 'Search cars by model',
      searchQuery: model,
      resultsCount: cars.length
    });

    return callback(null, cars);
  });
}

/**
 * Get cars by status
 * @param {Object} user - User performing the action
 * @param {string} status - Status to filter by
 * @param {Function} callback - Callback function (err, cars)
 */
function getCarsByStatus(user, status, callback) {
  canReadInventory(user, (err) => {
    if (err) {
      return callback(err);
    }

    const cars = Car.getCarsByStatus(status);
    
    // Log the filter operation
    logInventoryOperation(LOG_TYPES.READ, user, null, {
      action: 'Filter cars by status',
      filterStatus: status,
      resultsCount: cars.length
    });

    return callback(null, cars);
  });
}

module.exports = {
  getAllCars,
  getCarById,
  getInventoryStats,
  addCar,
  updateCar,
  deleteCar,
  searchCarsByModel,
  getCarsByStatus
};
