/**
 * Authorization Middleware
 * 
 * Provides middleware functions for role-based access control
 */

const { hasPermission, ROLES } = require('../config/roles');
const { logAccessDenied } = require('../utils/adminLogger');

/**
 * Check if a user has a specific permission
 * @param {string} permission - The permission to check
 * @returns {Function} Middleware function
 */
function requirePermission(permission) {
  return (user, action, callback) => {
    if (!user) {
      const error = new Error('Authentication required');
      error.code = 'UNAUTHORIZED';
      logAccessDenied(null, 'unknown', action);
      return callback(error);
    }

    if (!hasPermission(user.role, permission)) {
      const error = new Error(`Permission denied. Required permission: ${permission}`);
      error.code = 'FORBIDDEN';
      logAccessDenied(user, 'inventory', action);
      return callback(error);
    }

    return callback(null, true);
  };
}

/**
 * Check if user can read inventory
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canReadInventory(user, callback) {
  return requirePermission('inventory:read')(user, 'read inventory', callback);
}

/**
 * Check if user can create inventory items
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canCreateInventory(user, callback) {
  return requirePermission('inventory:create')(user, 'create inventory item', callback);
}

/**
 * Check if user can update inventory items
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canUpdateInventory(user, callback) {
  return requirePermission('inventory:update')(user, 'update inventory item', callback);
}

/**
 * Check if user can delete inventory items
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canDeleteInventory(user, callback) {
  return requirePermission('inventory:delete')(user, 'delete inventory item', callback);
}

/**
 * Check if user can read logs
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canReadLogs(user, callback) {
  return requirePermission('logs:read')(user, 'read logs', callback);
}

/**
 * Check if user can manage logs
 * @param {Object} user - The user object
 * @param {Function} callback - Callback function
 * @returns {void}
 */
function canManageLogs(user, callback) {
  return requirePermission('logs:manage')(user, 'manage logs', callback);
}

/**
 * Check if user is an admin
 * @param {Object} user - The user object
 * @returns {boolean} True if user is admin
 */
function isAdmin(user) {
  return user && user.role === ROLES.ADMIN;
}

/**
 * Check if user is a manager
 * @param {Object} user - The user object
 * @returns {boolean} True if user is manager
 */
function isManager(user) {
  return user && user.role === ROLES.MANAGER;
}

/**
 * Check if user is an employee
 * @param {Object} user - The user object
 * @returns {boolean} True if user is employee
 */
function isEmployee(user) {
  return user && user.role === ROLES.EMPLOYEE;
}

module.exports = {
  requirePermission,
  canReadInventory,
  canCreateInventory,
  canUpdateInventory,
  canDeleteInventory,
  canReadLogs,
  canManageLogs,
  isAdmin,
  isManager,
  isEmployee
};
