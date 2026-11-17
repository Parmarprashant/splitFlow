const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../config/jwt');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const defaultUpi = `${firstName}@upi`;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      upiId: defaultUpi,
      bankAccount: '',
      gentleReminders: true,
    });

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUri: user.photoUri,
        qrCodeUri: user.qrCodeUri,
        upiId: user.upiId,
        bankAccount: user.bankAccount,
        gentleReminders: user.gentleReminders,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUri: user.photoUri,
        qrCodeUri: user.qrCodeUri,
        upiId: user.upiId,
        bankAccount: user.bankAccount,
        gentleReminders: user.gentleReminders,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// GET /api/auth/me or /api/auth/profile
const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = userId
      ? await User.findById(userId).select('-password')
      : await User.findOne().sort({ createdAt: -1 }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, photoUri, qrCodeUri, upiId, bankAccount, gentleReminders, email } = req.body;
    let query = {};
    if (req.user?.id) {
      query._id = req.user.id;
    } else if (email) {
      query.email = email.trim().toLowerCase();
    } else {
      const latest = await User.findOne().sort({ createdAt: -1 });
      if (latest) query._id = latest._id;
    }

    const user = await User.findOneAndUpdate(
      query,
      {
        ...(name && { name }),
        ...(photoUri !== undefined && { photoUri }),
        ...(qrCodeUri !== undefined && { qrCodeUri }),
        ...(upiId !== undefined && { upiId }),
        ...(bankAccount !== undefined && { bankAccount }),
        ...(gentleReminders !== undefined && { gentleReminders }),
      },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, refreshToken, getMe, updateProfile, logout };
