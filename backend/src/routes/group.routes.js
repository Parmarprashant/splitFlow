const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');

router.post('/', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/', groupController.getGroups);
router.get('/summary', groupController.getGroupSummary);
router.post('/:id/members', groupController.addMemberToGroup);
router.get('/:id', groupController.getGroupById);
router.get('/:id/summary', groupController.getGroupSummary);

module.exports = router;
