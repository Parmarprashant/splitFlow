const Expense = require('../models/expense.model');
const Group = require('../models/group.model');
const Activity = require('../models/activity.model');

// POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const {
      amount,
      description,
      category = 'miscellaneous',
      paidByName = 'Me',
      groupId,
      intent,
    } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Find group (or use latest group if not specified)
    let group = null;
    if (groupId) {
      group = await Group.findById(groupId);
    }
    if (!group) {
      group = await Group.findOne().sort({ createdAt: -1 });
    }

    const numAmount = parseFloat(amount);
    const members = group?.members && group.members.length > 0 ? group.members : [{ name: paidByName || 'You' }];
    const splitAmount = parseFloat((numAmount / members.length).toFixed(2));

    const splits = members.map((m) => ({
      name: m.name,
      amount: splitAmount,
    }));

    const expense = await Expense.create({
      group: group ? group._id : null,
      amount: numAmount,
      description: description.trim(),
      category: category.toLowerCase(),
      paidBy: {
        user: req.user?.id || null,
        name: paidByName === 'me' ? 'You' : paidByName,
      },
      splits,
      intent,
    });

    // Create Activity entry matching screenshot
    const iconMap = {
      dinner: { type: 'food', bg: '#FEF3C7', color: '#92400E' },
      food: { type: 'food', bg: '#FEF3C7', color: '#92400E' },
      travel: { type: 'flight', bg: '#FFEDD5', color: '#9A3412' },
      drinks: { type: 'food', bg: '#EDE9FE', color: '#6D28D9' },
      shopping: { type: 'shopping', bg: '#EDE9FE', color: '#4338CA' },
      miscellaneous: { type: 'sledding', bg: '#EDE9FE', color: '#6D28D9' },
    };

    const iconInfo = iconMap[category.toLowerCase()] || iconMap.food;

    if (group) {
      await Activity.create({
        group: group._id,
        type: 'expense',
        title: description.trim(),
        meta: `${paidByName === 'me' ? 'You' : paidByName} added . ₹${numAmount.toLocaleString()} . Just now`,
        amount: `₹${numAmount.toLocaleString()}`,
        amountColor: 'purple',
        iconType: iconInfo.type,
        badgeBg: iconInfo.bg,
        iconColor: iconInfo.color,
      });
    }

    res.status(201).json({ expense });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/expenses/group/:groupId
const getExpensesByGroup = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId }).sort({
      createdAt: -1,
    });
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/expenses/intent
const trackIntent = async (req, res) => {
  try {
    const { plan, message, targetUserName = 'Rohan', amount = '870.50' } = req.body;

    // Log Activity for Intent
    const group = await Group.findOne().sort({ createdAt: -1 });

    if (group) {
      await Activity.create({
        group: group._id,
        type: 'intent',
        title: `Payment Intent to ${targetUserName}`,
        meta: `Shared intent: "${plan}" . Just now`,
        amount: `₹${amount}`,
        amountColor: 'green',
        iconType: 'settlement',
        badgeBg: '#DCFCE7',
        iconColor: '#166534',
      });
    }

    res.json({
      message: 'Intent recorded successfully',
      intent: { plan, message, targetUserName, setAt: new Date() },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addExpense,
  getExpensesByGroup,
  trackIntent,
};
