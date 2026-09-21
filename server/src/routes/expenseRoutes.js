const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenseTrend
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(auth);

router.get('/summary', getExpenseSummary);
router.get('/trend', getExpenseTrend);

router.route('/')
  .get(getExpenses)
  .post(
    [
      body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
      body('category').isIn(['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other']).withMessage('Invalid category'),
      body('date').optional().isISO8601().withMessage('Valid date required'),
      body('note').optional().isString().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
    ],
    createExpense
  );

router.route('/:id')
  .put(
    [
      body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
      body('category').optional().isIn(['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other']).withMessage('Invalid category'),
      body('date').optional().isISO8601().withMessage('Valid date required'),
      body('note').optional().isString().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
    ],
    updateExpense
  )
  .delete(deleteExpense);

module.exports = router;
