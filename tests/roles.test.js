/**
 * Tests for Role-Based Access Control
 */

const { ROLES, PERMISSIONS, hasPermission, getPermissions, isValidRole } = require('../src/config/roles');

describe('Roles Configuration', () => {
  describe('ROLES', () => {
    test('should define admin role', () => {
      expect(ROLES.ADMIN).toBe('admin');
    });

    test('should define manager role', () => {
      expect(ROLES.MANAGER).toBe('manager');
    });

    test('should define employee role', () => {
      expect(ROLES.EMPLOYEE).toBe('employee');
    });
  });

  describe('isValidRole', () => {
    test('should return true for valid roles', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('manager')).toBe(true);
      expect(isValidRole('employee')).toBe(true);
    });

    test('should return false for invalid roles', () => {
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null)).toBe(false);
    });
  });

  describe('Admin Permissions', () => {
    test('should have inventory:read permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'inventory:read')).toBe(true);
    });

    test('should have inventory:create permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'inventory:create')).toBe(true);
    });

    test('should have inventory:update permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'inventory:update')).toBe(true);
    });

    test('should have inventory:delete permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'inventory:delete')).toBe(true);
    });

    test('should have logs:read permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'logs:read')).toBe(true);
    });

    test('should have logs:manage permission', () => {
      expect(hasPermission(ROLES.ADMIN, 'logs:manage')).toBe(true);
    });
  });

  describe('Manager Permissions', () => {
    test('should have inventory:read permission', () => {
      expect(hasPermission(ROLES.MANAGER, 'inventory:read')).toBe(true);
    });

    test('should have inventory:create permission', () => {
      expect(hasPermission(ROLES.MANAGER, 'inventory:create')).toBe(true);
    });

    test('should have inventory:update permission', () => {
      expect(hasPermission(ROLES.MANAGER, 'inventory:update')).toBe(true);
    });

    test('should NOT have inventory:delete permission', () => {
      // KEY TEST: Managers cannot delete cars
      expect(hasPermission(ROLES.MANAGER, 'inventory:delete')).toBe(false);
    });

    test('should have logs:read permission', () => {
      expect(hasPermission(ROLES.MANAGER, 'logs:read')).toBe(true);
    });

    test('should NOT have logs:manage permission', () => {
      expect(hasPermission(ROLES.MANAGER, 'logs:manage')).toBe(false);
    });
  });

  describe('Employee Permissions', () => {
    test('should have inventory:read permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'inventory:read')).toBe(true);
    });

    test('should NOT have inventory:create permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'inventory:create')).toBe(false);
    });

    test('should NOT have inventory:update permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'inventory:update')).toBe(false);
    });

    test('should NOT have inventory:delete permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'inventory:delete')).toBe(false);
    });

    test('should NOT have logs:read permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'logs:read')).toBe(false);
    });

    test('should NOT have logs:manage permission', () => {
      expect(hasPermission(ROLES.EMPLOYEE, 'logs:manage')).toBe(false);
    });
  });

  describe('getPermissions', () => {
    test('should return all admin permissions', () => {
      const permissions = getPermissions(ROLES.ADMIN);
      expect(permissions).toContain('inventory:read');
      expect(permissions).toContain('inventory:create');
      expect(permissions).toContain('inventory:update');
      expect(permissions).toContain('inventory:delete');
      expect(permissions).toContain('logs:read');
      expect(permissions).toContain('logs:manage');
    });

    test('should return manager permissions without delete', () => {
      const permissions = getPermissions(ROLES.MANAGER);
      expect(permissions).toContain('inventory:read');
      expect(permissions).toContain('inventory:create');
      expect(permissions).toContain('inventory:update');
      expect(permissions).not.toContain('inventory:delete');
    });

    test('should return limited employee permissions', () => {
      const permissions = getPermissions(ROLES.EMPLOYEE);
      expect(permissions).toContain('inventory:read');
      expect(permissions.length).toBe(1);
    });

    test('should return empty array for invalid role', () => {
      expect(getPermissions('invalid')).toEqual([]);
    });
  });
});
