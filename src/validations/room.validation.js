const Joi = require('joi');

const createRoom = {
  body: Joi.object().keys({
    roomName: Joi.string().optional(),
    wallet: Joi.string().required(),
  }),
};

const createToken = {
  body: Joi.object().keys({
    participantName: Joi.string().required(),
    roomName: Joi.string().required(),
    wallet: Joi.string().required(),
    identity: Joi.string().required(),
  }),
};

const getRooms = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createRoom,
  createToken,
  getRooms,
};
