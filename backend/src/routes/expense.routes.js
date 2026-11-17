const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');

router.post('/', expenseController.addExpense);
router.post('/intent', expenseController.trackIntent);
router.get('/group/:groupId', expenseController.getExpensesByGroup);

module.exports = router;
