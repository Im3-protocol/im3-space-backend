const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sid: {
      type: String,
      required: true,
      trim: true,
    },
    emptyTimeout: {
      type: Number,
    },
    departureTimeout: {
      type: Number,
    },
    maxParticipants: {
      type: Number,
    },
    creationTime: {
      type: BigInt,
    },
    turnPassword: {
      type: String,
    },
    metadata: {
      type: String,
    },
    numParticipants: {
      type: Number,
    },
    numPublishers: {
      type: Number,
    },
    activeRecording: {
      type: Boolean,
    },
    finishedAt: {
      type: BigInt,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.plugin(toJSON);
roomSchema.plugin(paginate);

/**
 * @typedef Room
 */
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
