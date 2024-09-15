const express = require('express');
const { createAdmin, removeAdmin, getAdminsList } = require('../../controllers/admin.controller');

const router = express.Router();

router.post('/add-admin', createAdmin);
router.delete('/remove-admin/:identity', removeAdmin);

router.get('/admins/sort', getAdminsList);

module.exports = router;
