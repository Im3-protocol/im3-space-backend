/* eslint-disable no-console */
const httpStatus = require('http-status');
const { v4 } = require('uuid');
const { zeroAddress } = require('viem');
const catchAsync = require('../utils/catchAsync');
const { roomService } = require('../services');
const livekit = require('../utils/esmHelper');
const config = require('../config/config');
const { Event, Room } = require('../models');
const logger = require('../config/logger');
const readMeetConfig = require('../utils/readMeetConfig');

let meetConfig = null;

try {
  meetConfig = readMeetConfig('muon');
  console.log('meetConfig loaded successfully');
} catch (error) {
  console.error('An error occurred while loading meetConfig:', error);
}
let webhookReceiver;

livekit().then((lkv) => {
  const { WebhookReceiver } = lkv;
  webhookReceiver = new WebhookReceiver(config.im3.apiKey, config.im3.apiSecret);
});

const createRoom = catchAsync(async (req, res) => {
  // const { roomName } = req.body;
  const { roomName } = meetConfig;
  console.log(meetConfig.roomName);
  const room = await roomService.createRoom({ name: roomName });

  // Generate the room URL

  // Respond with room details including the URL
  res.status(httpStatus.CREATED).send({
    room,
    url: roomName,
  });
});

const createToken = catchAsync(async (req, res) => {
  try {
    const { roomName, participantName } = req.body;
    const { whiteListParticipants, owner, admins } = meetConfig;
    const { privateRoom } = meetConfig.ui;
    let { identity } = req.body;

    console.log('Incoming request data:', { roomName, participantName, identity });
    console.log('This is meetConfig:', meetConfig);

    // Default identity check
    if (identity === zeroAddress) {
      identity = v4();
      console.log('Generated new identity:', identity);
    }

    // Authorization check for private room
    if (privateRoom && owner !== identity && !admins.includes(identity) && !whiteListParticipants.includes(identity)) {
      console.error('Authorization failed for identity:', identity);
      return res.status(403).json({ message: 'You are not authorized to join this room.' });
    }

    // Token creation
    const token = await roomService.createToken(roomName, participantName, identity.toLowerCase());
    console.log('Token successfully created for identity:', identity);
    res.send(token);
  } catch (error) {
    console.error('Error occurred in createToken:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

const webhook = catchAsync(async (req, res) => {
  const event = await webhookReceiver.receive(req.body, req.headers.authorization);
  switch (event.event) {
    case 'room_started': {
      const room = new Room(event.room);
      await room.save();
      logger.info(`room started with name: ${room.name}`);
      break;
    }
    case 'room_finished': {
      const room = await Room.findOne({ sid: event.room.sid });
      if (room) {
        room.finishedAt = event.createdAt;
        await room.save();
      }
      logger.info(`room finished with name: ${room.name}`);
      break;
    }

    case 'participant_joined': {
      const newEvent = new Event(event);
      newEvent.eventId = event.id;

      await newEvent.save();
      logger.info(
        `${event.participant.name} with identity: ${event.participant.identity} joined with room: ${event.room.name}`,
      );
      break;
    }
    case 'participant_left': {
      const newEvent = new Event(event);
      newEvent.eventId = event.id;
      await newEvent.save();
      logger.info(
        `${event.participant.name} with identity: ${event.participant.identity} left the room: ${event.room.name}`,
      );
      break;
    }
    default:
  }
  // res.writeHead(200);
  res.end();
});

const meetConfigUi = async (req, res) => {
  try {
    const { slug } = req.params;
    const slugConfig = await readMeetConfig(slug);
    const data = slugConfig.ui;
    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const readSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const slugConfig = await readMeetConfig(slug);
    console.log('this is slug config', slugConfig);
    return res.status(200).send(slugConfig);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error reading config', error: error.message });
  }
};

module.exports = {
  createRoom,
  createToken,
  webhook,
  meetConfigUi,
  readSlug,
};
