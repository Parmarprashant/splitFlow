const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlement.controller');

router.get('/balances', settlementController.getBalances);
router.post('/', settlementController.settleUp);
router.post('/settle-all', settlementController.settleAll);
router.get('/recent', settlementController.getRecentSettlements);

module.exports = router;
