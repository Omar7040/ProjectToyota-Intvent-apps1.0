/**
 * Tests for Admin Logger
 */

const adminLogger = require('../src/utils/adminLogger');
const { ROLES } = require('../src/config/roles');

describe('Admin Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    adminLogger.clearLogs();
  });

  describe('createLogEntry', () => {
    test('should create a log entry with all fields', () => {
      const entry = adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.CREATE,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        resourceId: 'CAR-1',
        action: 'Added new car',
        details: { model: 'Toyota Camry' },
        success: true
      });

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.type).toBe(adminLogger.LOG_TYPES.CREATE);
      expect(entry.userId).toBe('USER-1');
      expect(entry.userRole).toBe(ROLES.ADMIN);
      expect(entry.resource).toBe('inventory');
      expect(entry.resourceId).toBe('CAR-1');
      expect(entry.success).toBe(true);
    });

    test('should generate unique IDs for each entry', () => {
      const entry1 = adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.READ,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        action: 'Read operation'
      });

      const entry2 = adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.READ,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        action: 'Read operation'
      });

      expect(entry1.id).not.toBe(entry2.id);
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      // Create some test logs
      adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.CREATE,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        action: 'Created car'
      });

      adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.UPDATE,
        userId: 'USER-2',
        userRole: ROLES.MANAGER,
        resource: 'inventory',
        action: 'Updated car'
      });

      adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.READ,
        userId: 'USER-3',
        userRole: ROLES.EMPLOYEE,
        resource: 'inventory',
        action: 'Read inventory'
      });
    });

    test('should return all logs without filters', () => {
      const logs = adminLogger.getLogs();
      expect(logs.length).toBe(3);
    });

    test('should filter logs by type', () => {
      const logs = adminLogger.getLogs({ type: adminLogger.LOG_TYPES.CREATE });
      expect(logs.length).toBe(1);
      expect(logs[0].type).toBe(adminLogger.LOG_TYPES.CREATE);
    });

    test('should filter logs by userId', () => {
      const logs = adminLogger.getLogs({ userId: 'USER-2' });
      expect(logs.length).toBe(1);
      expect(logs[0].userId).toBe('USER-2');
    });

    test('should filter logs by resource', () => {
      const logs = adminLogger.getLogs({ resource: 'inventory' });
      expect(logs.length).toBe(3);
    });
  });

  describe('logInventoryOperation', () => {
    test('should log an inventory operation', () => {
      const user = { id: 'USER-1', role: ROLES.ADMIN };
      const car = { id: 'CAR-1', model: 'Toyota Camry' };

      adminLogger.logInventoryOperation(
        adminLogger.LOG_TYPES.CREATE,
        user,
        car,
        { action: 'Added new car' }
      );

      const logs = adminLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('inventory');
      expect(logs[0].resourceId).toBe('CAR-1');
    });
  });

  describe('logAccessDenied', () => {
    test('should log an access denied event', () => {
      const user = { id: 'USER-1', role: ROLES.MANAGER };

      adminLogger.logAccessDenied(user, 'inventory', 'delete car');

      const logs = adminLogger.getLogs({ type: adminLogger.LOG_TYPES.ACCESS_DENIED });
      expect(logs.length).toBe(1);
      expect(logs[0].success).toBe(false);
      expect(logs[0].userRole).toBe(ROLES.MANAGER);
    });
  });

  describe('clearLogs', () => {
    test('should clear all logs', () => {
      // Create some logs
      adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.READ,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        action: 'Read'
      });

      expect(adminLogger.getLogCount()).toBeGreaterThan(0);

      const clearedCount = adminLogger.clearLogs();
      expect(clearedCount).toBeGreaterThan(0);
      expect(adminLogger.getLogCount()).toBe(0);
    });
  });

  describe('getLogCount', () => {
    test('should return correct count', () => {
      expect(adminLogger.getLogCount()).toBe(0);

      adminLogger.createLogEntry({
        type: adminLogger.LOG_TYPES.READ,
        userId: 'USER-1',
        userRole: ROLES.ADMIN,
        resource: 'inventory',
        action: 'Read'
      });

      expect(adminLogger.getLogCount()).toBe(1);
    });
  });
});
