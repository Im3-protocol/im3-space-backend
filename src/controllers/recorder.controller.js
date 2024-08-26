const { EgressClient, EncodedFileOutput } = require('livekit-server-sdk');
const config = require('../config/config');

const createEgressClient = () => {
  return new EgressClient(config.apiKey, config.apiSecret, config.websocketUrl);
};

const listEgrees = async () => {
  const egressClient = createEgressClient();
  const res = await egressClient.listEgress();
  return res;
};

const startRecordComposite = async (roomName) => {
  const egressClient = createEgressClient();

  const fileOutput = new EncodedFileOutput({
    filepath: 'tmp/room-composite-test.mp4',
    output: {
      // case: 's3',
      // value: new S3Upload({
      //     accessKey: 'aws-access-key',
      //     secret:    'aws-access-secret',
      //     region:    'aws-region',
      //     bucket:    'my-bucket'
      // }),
    },
  });

  const info = await egressClient.startRoomCompositeEgress(
    roomName,
    {
      file: fileOutput,
    },
    {
      layout: 'speaker',
      // uncomment to use your own templates
      // customBaseUrl: 'https://my-template-url.com',
    },
  );
  const egressID = info.egressId;
  return egressID;
};

const stopRecordComposite = async (egressID) => {
  const egressClient = createEgressClient();
  const info = await egressClient.stopEgress(egressID);
  return info;
};

module.exports = {
  startRecordComposite,
  stopRecordComposite,
  listEgrees,
};
