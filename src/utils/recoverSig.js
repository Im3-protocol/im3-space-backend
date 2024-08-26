const { recoverMessageAddress, isAddress } = require('viem');
const config = require('../config/config');

const recoverSigner = (signature) => {
  return recoverMessageAddress({
    message: config.messageToSign,
    signature,
  });
};

const isSignerValid = async (signature) => {
  const wallet = await recoverSigner(signature);
  return isAddress(wallet);
};

module.exports = {
  isSignerValid,
  recoverSigner,
};
