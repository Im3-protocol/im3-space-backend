/* eslint-disable no-console */
const { v4 } = require('uuid');
const { isAddress } = require('viem');
const axios = require('axios');
const livekit = require('../utils/esmHelper');
const config = require('../config/config');
const Admin = require('../models/admin.model');
const readMeetConfig = require('../utils/readMeetConfig');

const roomService = async () => {
  const { RoomServiceClient } = await livekit();
  return new RoomServiceClient(config.im3.websocketUrl, config.im3.apiKey, config.im3.apiSecret);
};

const createRoom = async () => {
  const roomName = v4(); // Generate a new room name
  const meetConfig = readMeetConfig(roomName);
  const opts = {
    name: roomName,
    emptyTimeout: meetConfig.emptyTimeout || 600, // Default to 10 minutes
    maxParticipants: meetConfig.maxParticipants || 20,
  };
  const roomService_ = await roomService();
  return roomService_.createRoom(opts);
};

const roomAdmins = new Map();

const createToken = async (roomName, participantName, identity) => {
  const { AccessToken } = await livekit();
  const meetConfig = readMeetConfig(roomName);
  const userName = isAddress(identity.toLowerCase())
    ? `${participantName}-${identity.slice(0, 6)}...${identity.slice(-6)}`
    : participantName;

  const at = new AccessToken(config.im3.apiKey, config.im3.apiSecret, {
    name: userName,
    identity: identity.toLowerCase(),
    ttl: '10m', // Token expires in 10 minutes
  });
  const { owner, admins, ui, whiteListParticipants, apiVersion, defaultConfig } = meetConfig;
  try {
    if (!defaultConfig) {
      const { privateRoom } = ui;
      if (apiVersion === '1.0.0') {
        // filter the current user to find its rule
        if (identity.toLowerCase() === owner.toLowerCase()) {
          at.addGrant({
            roomJoin: true,
            room: roomName,
            canSubscribe: true,
            canPublish: true,
            canPublishData: true,
            roomAdmin: true,
            roomRecord: true,
          });
          const newOwner = new Admin({ identity: owner.toLowerCase(), roomName, participantName, isOwner: true });
          await newOwner.save();
        } else if (admins.map((admin) => admin.toLowerCase()).includes(identity)) {
          at.addGrant({
            roomJoin: true,
            room: roomName,
            canSubscribe: true,
            canPublish: true,
            canPublishData: true,
            roomAdmin: true,
            roomRecord: true,
          });
          const newAdmin = new Admin({ identity: identity.toLowerCase(), roomName, participantName });
          await newAdmin.save();
        } else if (privateRoom && whiteListParticipants.map((participant) => participant.toLowerCase()).includes(identity)) {
          at.addGrant({
            roomJoin: true,
            room: roomName,
            canSubscribe: true,
            canPublish: false,
            canPublishData: true,
          });
        } else if (
          privateRoom &&
          owner.toLowerCase() !== identity.toLowerCase() &&
          !admins.includes(identity.toLowerCase()) &&
          !whiteListParticipants.includes(identity.toLowerCase())
        ) {
          throw new Error('User is not in the whitelist for this private room');
        } else if (!privateRoom) {
          at.addGrant({
            roomJoin: true,
            room: roomName,
            canSubscribe: true,
            canPublish: false,
            canPublishData: true,
          });
        }
      }
    }
    if (meetConfig.defaultConfig || !meetConfig) {
      // eslint-disable-next-line no-lonely-if
      // logic for when meetConfig does not exit
      // Fetch the list of participants in the room
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
        roomAdmins.set(roomName, identity.toLowerCase());
        const newAdmin = new Admin({ identity: identity.toLowerCase(), roomName, participantName });
        await newAdmin.save();
      } else {
        const currentAdmin = roomAdmins.get(roomName);
        if (currentAdmin.toLowerCase() === identity.toLowerCase()) {
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
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching participants: ${error.message}`);
    throw new Error(error);
  }

  return at.toJwt();
};

module.exports = {
  createRoom,
  createToken,
};
