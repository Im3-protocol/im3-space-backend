const { v4 } = require('uuid');
const { isAddress } = require('viem');
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const livekit = require('../utils/esmHelper');
const config = require('../config/config');
// eslint-disable-next-line import/no-extraneous-dependencies
const Admin = require('../models/admin.model');

const roomService = async () => {
  const { RoomServiceClient } = await livekit();
  return new RoomServiceClient(config.im3.websocketUrl, config.im3.apiKey, config.im3.apiSecret);
};

const createRoom = async () => {
  // const { roomName } = roomBody;
  // const roomNameToSet = roomName ? roomName : v4();
  const roomName = v4();
  const opts = {
    name: roomName,
    emptyTimeout: 10 * 60, // 10 minutes
    maxParticipants: 20,
  };
  const roomService_ = await roomService();
  return roomService_.createRoom(opts);
};
const roomAdmins = new Map();

const createToken = async (roomName, participantName, identity) => {
  const { AccessToken } = await livekit();
  const userName = isAddress(identity)
    ? `${participantName}-${identity.slice(0, 6)}...${identity.slice(-6)}`
    : `${participantName}`;
  const at = new AccessToken(config.im3.apiKey, config.im3.apiSecret, {
    name: userName,
    identity,
    // Token to expire after 10 minutes
    ttl: '10m',
  });

  try {
    const response = await axios.get(`${process.env.API_URL}/api/v1/participants/list-participants?room=${roomName}`);
    const listParticipants = response.data;
    const participantCount = listParticipants.length;

    if (participantCount === 0) {
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: true,
        canPublishData: true,
        roomAdmin: true,
        roomRecord: true,
      });
      roomAdmins.set(roomName, identity, participantName); // Store the admin identity
      const newAdmin = new Admin({ identity, roomName, participantName });
      newAdmin.save();
    } else {
      const currentAdmin = roomAdmins.get(roomName);
      if (currentAdmin === identity) {
        at.addGrant({
          roomJoin: true,
          room: roomName,
          canSubscribe: true,
          canPublish: true,
          canPublishData: true,
          roomRecord: true,
        });
      } else {
        at.addGrant({
          roomJoin: true,
          room: roomName,
          canSubscribe: true,
          canPublish: false,
          canPublishData: true,
        });
      }
    }
  } catch {
    throw new Error(Error);
  }
  return at.toJwt();
};

module.exports = {
  createRoom,
  createToken,
};
