const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const { authMiddleware } = require('../../helpers/auth');
const authController = require('./auth.controller');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, authController.me);

// PUT /api/auth/change-password (protected)
router.put(
  '/change-password',
  authMiddleware,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
