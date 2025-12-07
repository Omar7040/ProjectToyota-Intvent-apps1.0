/**
 * Car Model
 * 
 * Represents cars in the inventory
 */

/**
 * In-memory car storage (in production, this would be a database)
 */
let cars = [];
let carIdCounter = 1;

/**
 * Car status enumeration
 */
const CAR_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  IN_TRANSIT: 'in_transit',
  MAINTENANCE: 'maintenance'
};

/**
 * Create a new car entry
 * @param {Object} carData - Car data
 * @param {string} carData.vin - Vehicle Identification Number
 * @param {string} carData.model - Car model
 * @param {number} carData.year - Year of manufacture
 * @param {string} carData.color - Car color
 * @param {number} carData.price - Price
 * @param {string} carData.status - Car status
 * @returns {Object} Created car
 */
function createCar({ vin, model, year, color, price, status = CAR_STATUS.AVAILABLE }) {
  // Check for duplicate VIN
  if (cars.some(car => car.vin === vin)) {
    throw new Error(`Car with VIN ${vin} already exists`);
  }

  const car = {
    id: `CAR-${carIdCounter++}`,
    vin,
    model,
    year,
    color,
    price,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  cars.push(car);
  return car;
}

/**
 * Get a car by ID
 * @param {string} carId - Car ID
 * @returns {Object|null} Car or null if not found
 */
function getCarById(carId) {
  return cars.find(car => car.id === carId) || null;
}

/**
 * Get a car by VIN
 * @param {string} vin - Vehicle Identification Number
 * @returns {Object|null} Car or null if not found
 */
function getCarByVin(vin) {
  return cars.find(car => car.vin === vin) || null;
}

/**
 * Get all cars
 * @returns {Object[]} Array of cars
 */
function getAllCars() {
  return [...cars];
}

/**
 * Get cars by status
 * @param {string} status - Status to filter by
 * @returns {Object[]} Array of cars with the specified status
 */
function getCarsByStatus(status) {
  return cars.filter(car => car.status === status);
}

/**
 * Get cars by model
 * @param {string} model - Model to filter by
 * @returns {Object[]} Array of cars with the specified model
 */
function getCarsByModel(model) {
  return cars.filter(car => car.model.toLowerCase().includes(model.toLowerCase()));
}

/**
 * Update a car
 * @param {string} carId - Car ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated car or null if not found
 */
function updateCar(carId, updates) {
  const carIndex = cars.findIndex(car => car.id === carId);
  if (carIndex === -1) {
    return null;
  }

  // Check for VIN uniqueness if VIN is being updated
  if (updates.vin && updates.vin !== cars[carIndex].vin) {
    if (cars.some(car => car.vin === updates.vin)) {
      throw new Error(`Car with VIN ${updates.vin} already exists`);
    }
  }

  cars[carIndex] = {
    ...cars[carIndex],
    ...updates,
    id: cars[carIndex].id, // Prevent ID change
    updatedAt: new Date().toISOString()
  };

  return cars[carIndex];
}

/**
 * Delete a car
 * @param {string} carId - Car ID
 * @returns {Object|null} Deleted car or null if not found
 */
function deleteCar(carId) {
  const carIndex = cars.findIndex(car => car.id === carId);
  if (carIndex === -1) {
    return null;
  }

  const deletedCar = cars[carIndex];
  cars.splice(carIndex, 1);
  return deletedCar;
}

/**
 * Clear all cars (for testing)
 */
function clearCars() {
  cars = [];
  carIdCounter = 1;
}

/**
 * Get inventory statistics
 * @returns {Object} Statistics about the inventory
 */
function getInventoryStats() {
  const stats = {
    total: cars.length,
    byStatus: {},
    byModel: {},
    totalValue: 0
  };

  cars.forEach(car => {
    // Count by status
    stats.byStatus[car.status] = (stats.byStatus[car.status] || 0) + 1;
    
    // Count by model
    stats.byModel[car.model] = (stats.byModel[car.model] || 0) + 1;
    
    // Sum total value
    stats.totalValue += car.price || 0;
  });

  return stats;
}

/**
 * Initialize sample cars (for demo/testing)
 */
function initializeSampleCars() {
  clearCars();

  createCar({
    vin: 'JTDKN3DU0A0123456',
    model: 'Toyota Camry',
    year: 2024,
    color: 'Silver',
    price: 28000,
    status: CAR_STATUS.AVAILABLE
  });

  createCar({
    vin: 'JTDKN3DU0A0123457',
    model: 'Toyota Corolla',
    year: 2024,
    color: 'White',
    price: 23000,
    status: CAR_STATUS.AVAILABLE
  });

  createCar({
    vin: 'JTDKN3DU0A0123458',
    model: 'Toyota RAV4',
    year: 2024,
    color: 'Blue',
    price: 35000,
    status: CAR_STATUS.RESERVED
  });

  createCar({
    vin: 'JTDKN3DU0A0123459',
    model: 'Toyota Highlander',
    year: 2024,
    color: 'Black',
    price: 42000,
    status: CAR_STATUS.IN_TRANSIT
  });
}

module.exports = {
  CAR_STATUS,
  createCar,
  getCarById,
  getCarByVin,
  getAllCars,
  getCarsByStatus,
  getCarsByModel,
  updateCar,
  deleteCar,
  clearCars,
  getInventoryStats,
  initializeSampleCars
};
