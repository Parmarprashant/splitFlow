const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    photoUri: {
      type: String,
      default: null,
    },
    qrCodeUri: {
      type: String,
      default: null,
    },
    upiId: {
      type: String,
      default: '',
    },
    bankAccount: {
      type: String,
      default: '',
    },
    gentleReminders: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
