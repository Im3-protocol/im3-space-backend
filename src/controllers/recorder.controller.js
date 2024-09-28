/* eslint-disable no-console */
const config = require('../config/config');
const meetConfig = require('../utils/readMeetConfig');

let egressClientInstance = null;

const createEgressClient = async () => {
  if (!egressClientInstance) {
    const { EgressClient } = await import('livekit-server-sdk');
    egressClientInstance = new EgressClient(config.im3.websocketUrl, config.im3.apiKey, config.im3.apiSecret);
  }
  return egressClientInstance;
};

const outputFileName = (roomName, slugConfig) => {
  if (slugConfig && slugConfig.record.outputName) {
    return slugConfig.record.outputName;
  }
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${roomName}-${day}-${month}-${year}`;
};

const listEgrees = async (req, res) => {
  try {
    const egressClient = await createEgressClient();
    const egressList = await egressClient.listEgress();
    res.send(egressList);
  } catch (error) {
    console.error('Error occurred while listing egress services:', error);
    res.status(500).send({ message: 'Server Error', error: error.message });
  }
};

const startRecordComposite = async (req, res) => {
  const { roomName, slug } = req.params;
  const { audioOnly, videoOnly, layout } = req.body;
  try {
    const slugConfig = await meetConfig(slug);
    const { EncodedFileOutput } = await import('livekit-server-sdk');
    const egressClient = await createEgressClient();
    const fileName = outputFileName(roomName, slugConfig);

    const fileOutput = new EncodedFileOutput({
      filepath: `tmp/${fileName}.mp4`,
    });

    const info = await egressClient.startRoomCompositeEgress(
      roomName,
      { file: fileOutput },
      { layout, audioOnly, videoOnly },
    );
    console.log(layout);
    res.status(200).json({ egressId: info.egressId });
  } catch (error) {
    console.error('Error occurred while starting room composite egress:', error);
    res.status(500).send({ message: 'Failed to start recording', error: error.message });
  }
};

const stopRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const egressClient = await createEgressClient();
    const result = await egressClient.stopEgress(id);
    console.log(`Stopping egress for ID: ${id}`);
    res.send(result);
  } catch (error) {
    console.error(`Error occurred while stopping recording: ${error.message}`);
    res.status(error.response?.status || 500).send({
      message: 'Failed to stop recording',
      error: error.message,
      response: error.response?.data || null,
    });
  }
};

const startRecordSingleAudio = async (req, res) => {
  const { roomName, trackId, slug } = req.params;
  try {
    const slugConfig = await meetConfig(slug);
    const { EncodedFileOutput } = await import('livekit-server-sdk');
    const egressClient = await createEgressClient();
    const fileName = outputFileName(roomName, slugConfig);

    const fileOutput = new EncodedFileOutput({
      filepath: `tmp/${fileName}.mp4`,
    });

    const info = await egressClient.startTrackEgress(roomName, fileOutput, trackId);
    res.status(200).json({ egressId: info.egressId });
  } catch (error) {
    console.error('Error occurred while starting audio recording:', error);
    res.status(500).send({ message: 'Failed to start audio recording', error: error.message });
  }
};

const recordConfig = async (req, res) => {
  try {
    const { slug } = req.params;
    const slugConfig = await meetConfig(slug);
    res.status(200).send(slugConfig.record);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startRecordComposite,
  stopRecord,
  listEgrees,
  startRecordSingleAudio,
  recordConfig,
};
