const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  initials: {
    type: String,
    default: 'U',
  },
  badgeColor: {
    type: String,
    default: '#BF78EF',
  },
});

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['trip', 'rent', 'party', 'food', 'other'],
      default: 'trip',
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [memberSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save to ensure unique 6-character code
groupSchema.pre('save', function () {
  if (!this.code) {
    this.code = (
      this.name.slice(0, 3).toUpperCase() +
      Math.floor(100 + Math.random() * 900)
    ).replace(/[^A-Z0-9]/g, 'X');
  }
});

module.exports = mongoose.model('Group', groupSchema);
