const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboard, getTrends } = require('../controllers/analyticsController');

const router = express.Router();
router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/trends', getTrends);

module.exports = router;
