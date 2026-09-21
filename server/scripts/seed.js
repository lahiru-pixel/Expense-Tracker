require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expense_tracker');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Connection error', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await User.deleteMany();
    await Expense.deleteMany();
    await Budget.deleteMany();
    console.log('Database wiped');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Demo User 1', email: 'demo1@example.com', passwordHash },
      { name: 'Demo User 2', email: 'demo2@example.com', passwordHash }
    ]);

    const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'];
    const expenses = [];

    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const randomMonthsAgo = Math.floor(Math.random() * 6);
      const randomDaysAgo = Math.floor(Math.random() * 28);
      const date = new Date(now.getFullYear(), now.getMonth() - randomMonthsAgo, now.getDate() - randomDaysAgo);
      
      expenses.push({
        userId: users[0]._id, // Attach all to user 1 for a rich dashboard
        amount: Math.floor(Math.random() * 100) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        date,
        note: `Seeded expense ${i}`
      });
    }

    await Expense.insertMany(expenses);
    console.log('Inserted 60 demo expenses for Demo User 1');

    // Add some budgets
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      await Budget.create({
        userId: users[0]._id,
        month: monthStr,
        amount: 500
      });
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
