const express = require('express');

const router = express.Router();

// Define route handlers
router.get('/', (req, res) => {
  res.send('List of rooms');
});

router.post('/create-token', (req, res) => {
  res.send('Token created');
});

module.exports = router;
