const express = require('express');
const { body } = require('express-validator');
const validate = require('../../helpers/validate');
const storesController = require('./stores.controller');

const router = express.Router();

// Validation rules
const storeValidation = [
  body('name').notEmpty().withMessage('Store name is required').trim(),
  body('location').optional().trim(),
  body('phone_number').optional().trim(),
];

// Routes
router.get('/', storesController.getAll);
router.get('/:id', storesController.getById);
router.post('/', storeValidation, validate, storesController.create);
router.put('/:id', storeValidation, validate, storesController.update);
router.delete('/:id', storesController.delete);

module.exports = router;
