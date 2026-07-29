const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const categoriesController = require('./categories.controller');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('store_id').notEmpty().withMessage('Store ID is required').isInt(),
  body('name').notEmpty().withMessage('Category name is required').trim(),
  body('description').optional().trim(),
];

// Routes
router.get('/', categoriesController.getAll);
router.get('/store/:storeId', categoriesController.getByStore);
router.get('/:id', categoriesController.getById);
router.post('/', categoryValidation, validate, categoriesController.create);
router.put('/:id', categoryValidation, validate, categoriesController.update);
router.delete('/:id', categoriesController.delete);

module.exports = router;
