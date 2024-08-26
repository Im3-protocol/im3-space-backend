/* eslint-disable no-console */
const httpStatus = require('http-status');
const { v4 } = require('uuid');
const { zeroAddress } = require('viem');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { roomService } = require('../services');
const livekit = require('../utils/esmHelper');
const config = require('../config/config');
const { Event, Room } = require('../models');
const logger = require('../config/logger');

let webhookReceiver;

livekit().then((lkv) => {
  const { WebhookReceiver } = lkv;
  webhookReceiver = new WebhookReceiver(config.im3.apiKey, config.im3.apiSecret);
});

const createRoom = catchAsync(async (req, res) => {
  const room = await roomService.createRoom();
  res.status(httpStatus.CREATED).send(room);
});

const createToken = catchAsync(async (req, res) => {
  const { roomName, participantName } = req.body;
  let { identity } = req.body;
  // if (req.wallet !== identity.toLowerCase()) throw new ApiError(httpStatus.FORBIDDEN, 'Invalid identity address');
  if (identity === zeroAddress) {
    identity = v4();
  }
  const token = await roomService.createToken(roomName, participantName, identity.toLowerCase());
  res.send(token);
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

module.exports = {
  createRoom,
  createToken,
  webhook,
};
