/**
 * Role-based access control configuration
 * 
 * Roles:
 * - ADMIN: Full access to all inventory operations including logging
 * - MANAGER (GERENTE): Can view and modify inventory, but CANNOT delete cars
 * - EMPLOYEE (EMPLEADO): Limited read-only access to inventory
 */

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

/**
 * Permissions for each role
 * - inventory:read - Can view inventory
 * - inventory:create - Can add new cars to inventory
 * - inventory:update - Can update car information
 * - inventory:delete - Can delete cars from inventory
 * - logs:read - Can view admin logs
 * - logs:manage - Can manage (clear) admin logs
 */
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'inventory:read',
    'inventory:create',
    'inventory:update',
    'inventory:delete',
    'logs:read',
    'logs:manage'
  ],
  [ROLES.MANAGER]: [
    'inventory:read',
    'inventory:create',
    'inventory:update',
    'logs:read'
    // Note: managers cannot delete cars (no 'inventory:delete' permission)
  ],
  [ROLES.EMPLOYEE]: [
    'inventory:read'
    // Employees have limited read-only access
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} True if the role has the permission
 */
function hasPermission(role, permission) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) {
    return false;
  }
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a role
 * @param {string} role - The user's role
 * @returns {string[]} Array of permissions
 */
function getPermissions(role) {
  return PERMISSIONS[role] || [];
}

/**
 * Check if a role is valid
 * @param {string} role - The role to validate
 * @returns {boolean} True if the role is valid
 */
function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  getPermissions,
  isValidRole
};
