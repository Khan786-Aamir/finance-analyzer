const express = require('express');
const { protect } = require('../middleware/auth');
const { getBudget, updateBudget } = require('../controllers/budgetController');

const router = express.Router();
router.use(protect);
router.get('/', getBudget);
router.put('/', updateBudget);

module.exports = router;
