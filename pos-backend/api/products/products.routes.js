const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const productsController = require('./products.controller');

const router = express.Router();

// Validation rules
const productValidation = [
  body('store_id').notEmpty().withMessage('Store ID is required').isInt(),
  body('category_id').optional({ nullable: true }).isInt(),
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('sku').optional().trim(),
  body('is_active').optional().isBoolean(),
];

// Routes
router.get('/', productsController.getAll);
router.get('/store/:storeId', productsController.getByStore);
router.get('/:id', productsController.getById);
router.post('/', productValidation, validate, productsController.create);
router.put('/:id', productValidation, validate, productsController.update);
router.delete('/:id', productsController.delete);

module.exports = router;
