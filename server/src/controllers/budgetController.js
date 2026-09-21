const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');

const getBudget = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400);
      throw new Error('Valid month parameter (YYYY-MM) is required');
    }

    const budget = await Budget.findOne({ userId: req.user.userId, month });
    res.json(budget || { month, amount: 0 });
  } catch (error) {
    next(error);
  }
};

const upsertBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.details = errors.array();
    return next(err);
  }

  try {
    const { month, amount } = req.body;
    
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.userId, month },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudget, upsertBudget };
