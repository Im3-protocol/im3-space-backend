const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const eventSchema = mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: BigInt,
    },
    room: {
      name: {
        type: String,
      },
      sid: {
        type: String,
      },
    },
    participant: {
      sid: {
        type: String,
      },
      identity: {
        type: String,
      },
      state: {
        type: Number,
      },
      joinedAt: {
        type: BigInt,
      },
      name: {
        type: String,
      },
      isPublisher: {
        type: Boolean,
      },
      kind: {
        type: Number,
      },
      attributes: {
        type: Object,
      },
      permission: {
        canSubscribe: {
          type: Boolean,
        },
        canPublish: {
          type: Boolean,
        },
        canPublishData: {
          type: Boolean,
        },
        hidden: {
          type: Boolean,
        },
        recorder: {
          type: Boolean,
        },
        canUpdateMetadata: {
          type: Boolean,
        },
        agent: {
          type: Boolean,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.plugin(toJSON);
eventSchema.plugin(paginate);

/**
 * @typedef Event
 */
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
