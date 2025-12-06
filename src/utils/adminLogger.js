/**
 * Admin Logger - Audit logging system for inventory operations
 * 
 * This module provides comprehensive logging for all inventory actions
 * to maintain a secure audit trail for administrative purposes.
 */

const fs = require('fs');
const path = require('path');

/**
 * Log entry types for different operations
 */
const LOG_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  READ: 'READ',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ACCESS_DENIED: 'ACCESS_DENIED'
};

/**
 * In-memory log storage (in production, this would be a database)
 */
let logs = [];

/**
 * Log file path for persistent storage
 */
const LOG_FILE_PATH = path.join(__dirname, '../../logs/admin.log');

/**
 * Ensure the logs directory exists
 */
function ensureLogDirectory() {
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Create a new log entry
 * @param {Object} options - Log entry options
 * @param {string} options.type - Type of operation (CREATE, UPDATE, DELETE, etc.)
 * @param {string} options.userId - ID of the user performing the action
 * @param {string} options.userRole - Role of the user
 * @param {string} options.resource - The resource being accessed (e.g., 'inventory')
 * @param {string} options.resourceId - ID of the specific resource (e.g., car ID)
 * @param {string} options.action - Description of the action
 * @param {Object} options.details - Additional details about the action
 * @param {boolean} options.success - Whether the action was successful
 * @returns {Object} The created log entry
 */
function createLogEntry({
  type,
  userId,
  userRole,
  resource,
  resourceId = null,
  action,
  details = {},
  success = true
}) {
  const entry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    type,
    userId,
    userRole,
    resource,
    resourceId,
    action,
    details,
    success
  };

  logs.push(entry);
  
  // Also write to file for persistence
  appendToLogFile(entry);
  
  return entry;
}

/**
 * Generate a unique log ID
 * @returns {string} Unique ID
 */
function generateLogId() {
  return `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Append a log entry to the log file
 * @param {Object} entry - The log entry to append
 */
function appendToLogFile(entry) {
  try {
    ensureLogDirectory();
    const logLine = JSON.stringify(entry) + '\n';
    // Use asynchronous file operation to avoid blocking the event loop
    fs.appendFile(LOG_FILE_PATH, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err.message);
      }
    });
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

/**
 * Get all log entries
 * @param {Object} filters - Optional filters
 * @param {string} filters.type - Filter by log type
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.resource - Filter by resource
 * @param {Date} filters.startDate - Filter logs after this date
 * @param {Date} filters.endDate - Filter logs before this date
 * @returns {Object[]} Array of log entries
 */
function getLogs(filters = {}) {
  let filteredLogs = [...logs];

  if (filters.type) {
    filteredLogs = filteredLogs.filter(log => log.type === filters.type);
  }

  if (filters.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
  }

  if (filters.resource) {
    filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
  }

  if (filters.startDate) {
    const startTime = new Date(filters.startDate).getTime();
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= startTime);
  }

  if (filters.endDate) {
    const endTime = new Date(filters.endDate).getTime();
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= endTime);
  }

  return filteredLogs;
}

/**
 * Get a specific log entry by ID
 * @param {string} logId - The log ID
 * @returns {Object|null} The log entry or null if not found
 */
function getLogById(logId) {
  return logs.find(log => log.id === logId) || null;
}

/**
 * Clear all logs (admin only operation)
 * @returns {number} Number of logs cleared
 */
function clearLogs() {
  const count = logs.length;
  logs = [];
  
  // Also clear the log file
  try {
    ensureLogDirectory();
    fs.writeFileSync(LOG_FILE_PATH, '');
  } catch (error) {
    console.error('Failed to clear log file:', error.message);
  }
  
  return count;
}

/**
 * Log an inventory operation
 * @param {string} type - Operation type
 * @param {Object} user - User performing the operation
 * @param {Object} car - Car being operated on
 * @param {Object} details - Additional details
 * @param {boolean} success - Whether the operation was successful
 */
function logInventoryOperation(type, user, car, details = {}, success = true) {
  return createLogEntry({
    type,
    userId: user.id,
    userRole: user.role,
    resource: 'inventory',
    resourceId: car ? car.id : null,
    action: `${type} operation on inventory`,
    details: {
      carInfo: car,
      ...details
    },
    success
  });
}

/**
 * Log an access denied event
 * @param {Object} user - User who was denied access
 * @param {string} resource - Resource they tried to access
 * @param {string} action - Action they tried to perform
 */
function logAccessDenied(user, resource, action) {
  return createLogEntry({
    type: LOG_TYPES.ACCESS_DENIED,
    userId: user ? user.id : 'unknown',
    userRole: user ? user.role : 'unknown',
    resource,
    action,
    details: {
      message: 'Access denied due to insufficient permissions'
    },
    success: false
  });
}

/**
 * Get the count of logs
 * @returns {number} Total number of logs
 */
function getLogCount() {
  return logs.length;
}

module.exports = {
  LOG_TYPES,
  createLogEntry,
  getLogs,
  getLogById,
  clearLogs,
  logInventoryOperation,
  logAccessDenied,
  getLogCount
};
