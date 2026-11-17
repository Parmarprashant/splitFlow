const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { verifyAccessToken } = require('../config/jwt');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch (e) {}
  }
  next();
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', optionalAuth, authController.getMe);
router.get('/profile', optionalAuth, authController.getMe);
router.put('/profile', optionalAuth, authController.updateProfile);
router.post('/logout', optionalAuth, authController.logout);

module.exports = router;
