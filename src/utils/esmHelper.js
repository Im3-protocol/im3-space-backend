const livekit = async () => {
  const module = await import('livekit-server-sdk');
  return module;
};

module.exports = livekit;
