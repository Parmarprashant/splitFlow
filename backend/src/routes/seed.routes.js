const express = require('express');
const router = express.Router();
const { seedData } = require('../controllers/seed.controller');

router.post('/', seedData);
router.get('/', seedData);

module.exports = router;
