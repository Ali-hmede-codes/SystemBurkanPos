const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const ApiResponse = require('../../helpers/apiResponse');

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await User.getByUsername(username);
      if (!user) {
        return ApiResponse.error(res, 'Invalid username or password', 401);
      }

      // Check if user is active
      if (!user.is_active) {
        return ApiResponse.error(res, 'Account is disabled. Contact admin.', 403);
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password);
      if (!isValid) {
        return ApiResponse.error(res, 'Invalid username or password', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return ApiResponse.success(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      }, 'Login successful');
    } catch (error) {
      console.error('Login error:', error.message);
      return ApiResponse.error(res, 'Login failed');
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      const user = await User.getById(req.user.id);
      if (!user) return ApiResponse.notFound(res, 'User not found');
      return ApiResponse.success(res, user, 'User profile retrieved');
    } catch (error) {
      console.error('Get profile error:', error.message);
      return ApiResponse.error(res, 'Failed to get profile');
    }
  },

  // PUT /api/auth/change-password
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;

      const user = await User.getByUsername(req.user.username);
      const isValid = await User.verifyPassword(current_password, user.password);
      if (!isValid) {
        return ApiResponse.error(res, 'Current password is incorrect', 400);
      }

      await User.updatePassword(req.user.id, new_password);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error.message);
      return ApiResponse.error(res, 'Failed to change password');
    }
  },
};

module.exports = authController;
