const config = require('../config/config');

// Helper function to create a RoomServiceClient instance
const createRoomServiceClient = async () => {
  const { RoomServiceClient } = await import('livekit-server-sdk');
  const livekitHost = config.im3.websocketUrl;
  return new RoomServiceClient(livekitHost, config.im3.apiKey, config.im3.apiSecret);
};

const listParticipants = async (room) => {
  const roomService = await createRoomServiceClient();
  const res = await roomService.listParticipants(room);
  return res;
};

const kickParticipants = async (roomName, identity) => {
  const roomService = await createRoomServiceClient();
  const res = await roomService.removeParticipant(roomName, identity);
  return res;
};

const grantSpeak = async (roomName, identity) => {
  const roomService = await createRoomServiceClient();
  await roomService.updateParticipant(roomName, identity, undefined, {
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
};

const disableSpeak = async (roomName, identity) => {
  const roomService = await createRoomServiceClient();
  await roomService.updateParticipant(roomName, identity, undefined, {
    canPublish: false,
    canSubscribe: true,
    canPublishData: true,
    disableSpeak: true,
  });
};

const audience = async (roomName, identity) => {
  const roomService = await createRoomServiceClient();
  await roomService.updateParticipant(roomName, identity, undefined, {
    canPublish: false,
    canSubscribe: true,
    canPublishData: true,
  });
};

module.exports = {
  listParticipants,
  kickParticipants,
  grantSpeak,
  disableSpeak,
  audience,
};
