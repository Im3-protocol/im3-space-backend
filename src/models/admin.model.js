const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  identity: {
    type: String,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  participantName: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
    default: Date.now,
  },
  end: {
    type: Date,
    required: true,
    default: Date.now,
  },
  duration: {
    type: String,
  },
});

adminSchema.pre('save', function (next) {
  if (this.isModified('start') || this.isModified('end')) {
    const start = new Date(this.start);
    const end = new Date(this.end);
    const durationInMilliseconds = end - start;

    if (durationInMilliseconds > 0) {
      const durationInMinutes = Math.floor(durationInMilliseconds / 60000);
      this.duration = `${durationInMinutes} minutes`;
    } else {
      this.duration = 'Invalid duration';
    }
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
