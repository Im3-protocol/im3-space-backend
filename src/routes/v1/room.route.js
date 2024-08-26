const express = require('express');
// const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roomValidation = require('../../validations/room.validation');
const roomController = require('../../controllers/room.controller');

const router = express.Router();

router.route('/').post(validate(roomValidation.createRoom), roomController.createRoom);

router.route('/create-token').post(validate(roomValidation.createToken), roomController.createToken);
router.route('/webhook').post(express.text({ type: '*/*' }), roomController.webhook);
// router.route('/listParticipants').post(listParticipants())

module.exports = router;
