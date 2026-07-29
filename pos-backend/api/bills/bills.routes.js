const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const billsController = require('./bills.controller');

const router = express.Router();

// Validation rules for creating/updating a bill
const billValidation = [
  body('store_id').notEmpty().withMessage('Store ID is required').isInt(),
  body('customer_name').notEmpty().withMessage('Customer name is required').trim(),
  body('customer_phone').optional().trim(),
  body('customer_address').optional().trim(),
  body('delivery_cost').optional().isFloat({ min: 0 }).withMessage('Delivery cost must be a positive number'),
  body('status').optional().isIn(['draft', 'confirmed', 'delivered', 'cancelled']),
  body('notes').optional().trim(),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').notEmpty().withMessage('Product ID is required').isInt(),
  body('items.*.product_name').notEmpty().withMessage('Product name is required').trim(),
  body('items.*.price').notEmpty().withMessage('Item price is required').isFloat({ min: 0 }),
  body('items.*.quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }),
];

// Routes
router.get('/', billsController.getAll);
router.get('/:id', billsController.getById);
router.post('/', billValidation, validate, billsController.create);
router.put('/:id', billValidation, validate, billsController.update);
router.patch('/:id/status', billsController.updateStatus);
router.delete('/:id', billsController.delete);

module.exports = router;
