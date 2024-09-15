const NodeCache = require('node-cache');
const config = require('../config/config');

const participantsCache = new NodeCache({ stdTTL: 5 });

// Helper function to create a RoomServiceClient instance
const createRoomServiceClient = async () => {
  const { RoomServiceClient } = await import('livekit-server-sdk');
  const livekitHost = config.im3.websocketUrl;
  return new RoomServiceClient(livekitHost, config.im3.apiKey, config.im3.apiSecret);
};

const listParticipants = async (room) => {
  let participants = participantsCache.get(`participants_${room}`);

  if (!participants) {
    const roomService = await createRoomServiceClient();
    participants = await roomService.listParticipants(room);
    participantsCache.set(`participants_${room}`, participants);
    // eslint-disable-next-line no-console
    console.log(`Fetched participants for room "${room}" from RoomServiceClient and cached.`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Retrieved participants for room "${room}" from cache.`);
  }

  return participants;
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
