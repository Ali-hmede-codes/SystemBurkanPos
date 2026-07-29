const express = require('express');
const { authMiddleware } = require('../../helpers/auth');
const statsController = require('./stats.controller');

const router = express.Router();

// All stats routes require authentication
router.use(authMiddleware);

router.get('/today', statsController.getToday);
router.get('/monthly', statsController.getMonthly);
router.get('/daily', statsController.getDaily);
router.get('/by-store', statsController.getByStore);

module.exports = router;
