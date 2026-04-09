const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importCSV,
} = require('../controllers/transactionController');

const router = express.Router();

// Store CSV in memory (buffer) — no disk I/O
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect); // All transaction routes require auth

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/import-csv', upload.single('file'), importCSV);

module.exports = router;
