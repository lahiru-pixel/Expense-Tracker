const express = require('express');
const { body } = require('express-validator');
const { getBudget, upsertBudget } = require('../controllers/budgetController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getBudget)
  .put(
    [
      body('month').matches(/^\d{4}-\d{2}$/).withMessage('Valid month required (YYYY-MM)'),
      body('amount').isFloat({ min: 0 }).withMessage('Amount must be at least 0')
    ],
    upsertBudget
  );

module.exports = router;
