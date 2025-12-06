/**
 * Admin Log Controller
 * 
 * Handles admin log operations with role-based access control
 */

const adminLogger = require('../utils/adminLogger');
const { canReadLogs, canManageLogs } = require('../middleware/authorization');

/**
 * Get all logs
 * @param {Object} user - User performing the action
 * @param {Object} filters - Optional filters
 * @param {Function} callback - Callback function (err, logs)
 */
function getLogs(user, filters, callback) {
  // If filters is a function, it's the callback and there are no filters
  if (typeof filters === 'function') {
    callback = filters;
    filters = {};
  }

  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const logs = adminLogger.getLogs(filters);
    return callback(null, logs);
  });
}

/**
 * Get a specific log entry by ID
 * @param {Object} user - User performing the action
 * @param {string} logId - Log ID
 * @param {Function} callback - Callback function (err, log)
 */
function getLogById(user, logId, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const log = adminLogger.getLogById(logId);
    if (!log) {
      const error = new Error(`Log with ID ${logId} not found`);
      error.code = 'NOT_FOUND';
      return callback(error);
    }

    return callback(null, log);
  });
}

/**
 * Get log count
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, count)
 */
function getLogCount(user, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const count = adminLogger.getLogCount();
    return callback(null, count);
  });
}

/**
 * Clear all logs (admin only)
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, result)
 */
function clearLogs(user, callback) {
  canManageLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const clearedCount = adminLogger.clearLogs();
    
    // Log this action (after clearing, so we have a record of who cleared)
    adminLogger.createLogEntry({
      type: 'CLEAR_LOGS',
      userId: user.id,
      userRole: user.role,
      resource: 'logs',
      action: 'Clear all logs',
      details: {
        clearedCount
      },
      success: true
    });

    return callback(null, { cleared: clearedCount });
  });
}

/**
 * Get logs filtered by user
 * @param {Object} user - User performing the action
 * @param {string} targetUserId - User ID to filter logs by
 * @param {Function} callback - Callback function (err, logs)
 */
function getLogsByUser(user, targetUserId, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const logs = adminLogger.getLogs({ userId: targetUserId });
    return callback(null, logs);
  });
}

/**
 * Get logs filtered by type
 * @param {Object} user - User performing the action
 * @param {string} logType - Log type to filter by
 * @param {Function} callback - Callback function (err, logs)
 */
function getLogsByType(user, logType, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const logs = adminLogger.getLogs({ type: logType });
    return callback(null, logs);
  });
}

/**
 * Get inventory-related logs
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, logs)
 */
function getInventoryLogs(user, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const logs = adminLogger.getLogs({ resource: 'inventory' });
    return callback(null, logs);
  });
}

/**
 * Get access denied logs
 * @param {Object} user - User performing the action
 * @param {Function} callback - Callback function (err, logs)
 */
function getAccessDeniedLogs(user, callback) {
  canReadLogs(user, (err) => {
    if (err) {
      return callback(err);
    }

    const logs = adminLogger.getLogs({ type: adminLogger.LOG_TYPES.ACCESS_DENIED });
    return callback(null, logs);
  });
}

module.exports = {
  getLogs,
  getLogById,
  getLogCount,
  clearLogs,
  getLogsByUser,
  getLogsByType,
  getInventoryLogs,
  getAccessDeniedLogs
};
