const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const getExpenses = async (req, res, next) => {
  try {
    const { from, to, category, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user.userId };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.details = errors.array();
    return next(err);
  }

  try {
    const { amount, category, date, note } = req.body;
    const expense = await Expense.create({
      userId: req.user.userId,
      amount,
      category,
      date: date || Date.now(),
      note
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const err = new Error('Validation failed');
    err.details = errors.array();
    return next(err);
  }

  try {
    const { amount, category, date, note } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { amount, category, date, note },
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.json({ message: 'Expense removed' });
  } catch (error) {
    next(error);
  }
};

const getExpenseSummary = async (req, res, next) => {
  try {
    const { month } = req.query; // format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400);
      throw new Error('Valid month parameter (YYYY-MM) is required');
    }

    const [year, m] = month.split('-');
    const startDate = new Date(year, parseInt(m) - 1, 1);
    const endDate = new Date(year, parseInt(m), 1);

    const query = {
      userId: req.user.userId,
      date: { $gte: startDate, $lt: endDate }
    };

    const expenses = await Expense.find(query);
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    const byCategoryMap = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const byCategory = Object.keys(byCategoryMap).map(cat => ({
      category: cat,
      total: byCategoryMap[cat]
    }));

    // Find budget for the month
    const budgetDoc = await Budget.findOne({ userId: req.user.userId, month });
    const budget = budgetDoc ? budgetDoc.amount : 0;
    const remaining = budget > 0 ? budget - total : 0;

    res.json({
      total,
      byCategory,
      budget,
      remaining
    });
  } catch (error) {
    next(error);
  }
};

const getExpenseTrend = async (req, res, next) => {
  try {
    const monthsParam = parseInt(req.query.months) || 6;
    
    // Calculate start date (monthsParam months ago, first day of the month)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsParam + 1, 1);

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const results = await Expense.aggregate(pipeline);
    
    // Fill missing months with 0
    const trend = [];
    for (let i = monthsParam - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = results.find(r => r._id === monthStr);
      trend.push({
        month: monthStr,
        total: found ? found.total : 0
      });
    }

    res.json(trend);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenseTrend
};
