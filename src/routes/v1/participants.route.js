/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const {
  listParticipants,
  kickParticipants,
  grantSpeak,
  audience,
  disableSpeak,
} = require('../../controllers/participants.controller');

router.get('/list-participants', async (req, res) => {
  try {
    const participants = await listParticipants(req.query.room);
    res.send(participants);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/kick-participant', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    const result = await kickParticipants(roomName, identity);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/grant-speak', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    await grantSpeak(roomName, identity);
    res.status(200).send('Permissions granted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/disable-speak', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    await disableSpeak(roomName, identity);
    res.status(200).send('Disabled Mic');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/audience', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    await audience(roomName, identity);
    res.status(200).send('Permissions updated');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
