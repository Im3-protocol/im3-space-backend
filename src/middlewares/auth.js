const httpStatus = require('http-status');
const { isAddress } = require('viem');
const { zeroAddress } = require('viem');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { recoverSigner } = require('../utils/recoverSig');

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    const { wallet } = req.body;
    if (wallet === zeroAddress) {
      req.wallet = wallet.toLowerCase();
      resolve(true);
      return;
    }
    const signature = req.header('sig');
    if (!signature) reject(new ApiError(httpStatus.FORBIDDEN, 'Sign data with your wallet'));
    recoverSigner(signature)
      .then((signer) => {
        if (!isAddress(signer) || wallet.toLowerCase() !== signer.toLowerCase()) {
          return reject(new ApiError(httpStatus.FORBIDDEN, 'Invalid signature'));
        }
        req.wallet = signer.toLowerCase();
        resolve();
      })
      .catch((err_) => {
        logger.error(err_);
        return reject(new ApiError(httpStatus.BAD_GATEWAY, 'Invalid signature'));
      });
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
