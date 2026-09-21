const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 200 : 503;
  
  res.status(status).json({
    status: isDbConnected ? 'ok' : 'error',
    uptime: process.uptime(),
    db: isDbConnected ? 'connected' : 'down'
  });
});

module.exports = router;
