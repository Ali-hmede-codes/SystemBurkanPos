const User = require('../../models/User');
const ApiResponse = require('../../helpers/apiResponse');

const usersController = {
  // GET /api/users
  async getAll(req, res) {
    try {
      const users = await User.getAll();
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      console.error('Get users error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve users');
    }
  },

  // GET /api/users/:id
  async getById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) return ApiResponse.notFound(res, 'User not found');
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Get user error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve user');
    }
  },

  // POST /api/users
  async create(req, res) {
    try {
      const { username, password, full_name, role } = req.body;

      // Check if username exists
      const existing = await User.getByUsername(username);
      if (existing) {
        return ApiResponse.error(res, 'Username already exists', 409);
      }

      const user = await User.create({ username, password, full_name, role });
      return ApiResponse.created(res, user, 'User created successfully');
    } catch (error) {
      console.error('Create user error:', error.message);
      return ApiResponse.error(res, 'Failed to create user');
    }
  },

  // PUT /api/users/:id
  async update(req, res) {
    try {
      const existing = await User.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'User not found');

      const { username, full_name, role, is_active } = req.body;

      // Check username uniqueness (skip if same user)
      if (username !== existing.username) {
        const duplicate = await User.getByUsername(username);
        if (duplicate) {
          return ApiResponse.error(res, 'Username already exists', 409);
        }
      }

      const user = await User.update(req.params.id, {
        username,
        full_name,
        role,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      console.error('Update user error:', error.message);
      return ApiResponse.error(res, 'Failed to update user');
    }
  },

  // PUT /api/users/:id/reset-password
  async resetPassword(req, res) {
    try {
      const existing = await User.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'User not found');

      const { new_password } = req.body;
      await User.updatePassword(req.params.id, new_password);
      return ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error) {
      console.error('Reset password error:', error.message);
      return ApiResponse.error(res, 'Failed to reset password');
    }
  },

  // DELETE /api/users/:id
  async delete(req, res) {
    try {
      const existing = await User.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'User not found');

      // Prevent deleting self
      if (existing.id === req.user.id) {
        return ApiResponse.error(res, 'Cannot delete your own account', 400);
      }

      await User.delete(req.params.id);
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error.message);
      return ApiResponse.error(res, 'Failed to delete user');
    }
  },
};

module.exports = usersController;
