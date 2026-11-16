const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'settlement', 'intent'],
      default: 'expense',
    },
    title: {
      type: String,
      required: true,
    },
    meta: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    amountColor: {
      type: String,
      enum: ['purple', 'green'],
      default: 'purple',
    },
    iconType: {
      type: String,
      enum: ['food', 'settlement', 'sledding', 'flight', 'transfer', 'shopping'],
      default: 'food',
    },
    badgeBg: {
      type: String,
      default: '#FEF3C7',
    },
    iconColor: {
      type: String,
      default: '#92400E',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
