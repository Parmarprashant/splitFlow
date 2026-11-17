const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

router.get('/', activityController.getActivities);
router.get('/group/:groupId', activityController.getActivities);
router.post('/', activityController.createActivity);

module.exports = router;
