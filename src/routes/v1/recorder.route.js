const express = require('express');
const {
  startRecordComposite,
  stopRecord,
  listEgrees,
  startRecordSingleAudio,
} = require('../../controllers/recorder.controller');

const router = express.Router();

router.get('/active-recorders', listEgrees);

router.post('/start-record-composite/:roomName', startRecordComposite);

router.post('/stop-record-composite/:id', stopRecord);

router.post('/start-record-audio/:roomName/:trackId', startRecordSingleAudio);

module.exports = router;
