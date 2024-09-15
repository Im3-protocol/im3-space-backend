const NodeCache = require('node-cache');
const Admin = require('../models/admin.model');

const adminCache = new NodeCache({ stdTTL: 5 });

const getAdminsList = async (req, res) => {
  try {
    const { sort, room } = req.query;
    let cacheKey;
    let admins;

    if (sort === 'all') {
      cacheKey = 'allAdmins';
      admins = adminCache.get(cacheKey);

      if (!admins) {
        admins = await Admin.find();
        adminCache.set(cacheKey, admins);
      }
    } else if (sort === 'room' && room) {
      cacheKey = `admins_room_${room}`;
      admins = adminCache.get(cacheKey);

      if (!admins) {
        admins = await Admin.find({ roomName: room });
        adminCache.set(cacheKey, admins);
      }
    } else {
      return res.status(400).send('Invalid query parameters');
    }

    res.send(admins);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

const createAdmin = async (req, res) => {
  try {
    const { identity, roomName, participantName } = req.body;

    const existingAdmin = await Admin.findOne({ identity });

    if (!existingAdmin) {
      const newAdmin = new Admin({ identity, roomName, participantName });
      await newAdmin.save();

      res.status(201).json(newAdmin);
    } else {
      res.status(400).json({ message: 'User is already an admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { identity } = req.params;

    const existingAdmin = await Admin.findOne({ identity });

    if (existingAdmin) {
      await Admin.findOneAndDelete({ identity });

      res.status(200).json({ message: 'Admin removed successfully' });
    } else {
      res.status(400).json({ message: 'User is not an admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin', error });
  }
};

module.exports = {
  createAdmin,
  removeAdmin,
  getAdminsList,
};
