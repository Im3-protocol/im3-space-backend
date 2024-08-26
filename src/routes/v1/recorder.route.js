const express = require('express');
const { startRecordComposite, stopRecordComposite, listEgrees } = require('../../controllers/recorder.controller');

const router = express.Router();

router.get('/active-recorders', async (req, res) => {
  try {
    const activeRecorders = await listEgrees();
    res.send(activeRecorders);
  } catch (error) {
    res.status(500).send('something went wrong with get active-recorders');
  }
});

router.post('/start-record-composite/:roomName', async (req, res) => {
  try {
    const result = await startRecordComposite();
    res.send(result);
  } catch (error) {
    res.status(500).send('something went wrong with start-record-composite');
  }
});

router.post('/stop-record-composite', async (req, res) => {
  try {
    const result = await stopRecordComposite();
    res.send(result);
  } catch (error) {
    res.status(500).send('something went wrong with stop-record-composite');
  }
});

module.exports = router;
