const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const { authMiddleware, authorize } = require('../../helpers/auth');
const usersController = require('./users.controller');

const router = express.Router();

// All user routes require authentication + admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Validation rules
const createUserValidation = [
  body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3 }),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }),
  body('full_name').notEmpty().withMessage('Full name is required').trim(),
  body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
];

const updateUserValidation = [
  body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3 }),
  body('full_name').notEmpty().withMessage('Full name is required').trim(),
  body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean(),
];

// Routes
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', createUserValidation, validate, usersController.create);
router.put('/:id', updateUserValidation, validate, usersController.update);
router.put('/:id/reset-password',
  [body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  usersController.resetPassword
);
router.delete('/:id', usersController.delete);

module.exports = router;
