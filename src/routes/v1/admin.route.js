const express = require('express');
const { createAdmin, removeAdmin } = require('../../controllers/admin.controller');
const { Admin } = require('../../models');

const router = express.Router();

router.post('/add-admin', createAdmin);
router.delete('/remove-admin/:identity', removeAdmin);

router.get('/admins/sort', async (req, res) => {
  try {
    // /Admins/sort?sort=all
    if (req.query.sort === 'all') {
      const admins = await Admin.find();
      res.send(admins);
    } // /Admins/sort?sort=room&room=Room
    else if (req.query.sort === 'room' && req.query.room) {
      const admins = await Admin.find({ roomName: req.query.room });
      res.send(admins);
    } else {
      res.status(400).send('Invalid query parameters');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
