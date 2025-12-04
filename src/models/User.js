/**
 * User Model
 * 
 * Represents users in the system with role-based access
 */

const { ROLES, isValidRole } = require('../config/roles');

/**
 * In-memory user storage (in production, this would be a database)
 */
let users = [];
let userIdCounter = 1;

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.role - User role (admin, manager, employee)
 * @param {string} userData.name - Full name
 * @returns {Object} Created user
 * @throws {Error} If role is invalid
 */
function createUser({ username, email, role, name }) {
  if (!isValidRole(role)) {
    throw new Error(`Invalid role: ${role}. Valid roles are: ${Object.values(ROLES).join(', ')}`);
  }

  const user = {
    id: `USER-${userIdCounter++}`,
    username,
    email,
    role,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  return user;
}

/**
 * Get a user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User or null if not found
 */
function getUserById(userId) {
  return users.find(user => user.id === userId) || null;
}

/**
 * Get a user by username
 * @param {string} username - Username
 * @returns {Object|null} User or null if not found
 */
function getUserByUsername(username) {
  return users.find(user => user.username === username) || null;
}

/**
 * Get all users
 * @returns {Object[]} Array of users
 */
function getAllUsers() {
  return [...users];
}

/**
 * Get users by role
 * @param {string} role - Role to filter by
 * @returns {Object[]} Array of users with the specified role
 */
function getUsersByRole(role) {
  return users.filter(user => user.role === role);
}

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated user or null if not found
 */
function updateUser(userId, updates) {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return null;
  }

  // Validate role if being updated
  if (updates.role && !isValidRole(updates.role)) {
    throw new Error(`Invalid role: ${updates.role}`);
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: users[userIndex].id, // Prevent ID change
    updatedAt: new Date().toISOString()
  };

  return users[userIndex];
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteUser(userId) {
  const initialLength = users.length;
  users = users.filter(user => user.id !== userId);
  return users.length < initialLength;
}

/**
 * Clear all users (for testing)
 */
function clearUsers() {
  users = [];
  userIdCounter = 1;
}

/**
 * Initialize default users (for demo/testing)
 */
function initializeDefaultUsers() {
  clearUsers();
  
  // Create an admin user
  createUser({
    username: 'admin',
    email: 'admin@toyota-dealer.com',
    role: ROLES.ADMIN,
    name: 'System Administrator'
  });

  // Create a manager user
  createUser({
    username: 'gerente',
    email: 'gerente@toyota-dealer.com',
    role: ROLES.MANAGER,
    name: 'Juan García - Gerente'
  });

  // Create an employee user
  createUser({
    username: 'empleado',
    email: 'empleado@toyota-dealer.com',
    role: ROLES.EMPLOYEE,
    name: 'María López - Empleada'
  });
}

module.exports = {
  createUser,
  getUserById,
  getUserByUsername,
  getAllUsers,
  getUsersByRole,
  updateUser,
  deleteUser,
  clearUsers,
  initializeDefaultUsers
};
