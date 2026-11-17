const Settlement = require('../models/settlement.model');
const Group = require('../models/group.model');
const Activity = require('../models/activity.model');
const Expense = require('../models/expense.model');

// Default initial balances matching Figma dashboard
let dynamicBalances = [
  {
    id: '1',
    name: 'Rohan K.',
    group: 'Finland Trip Group',
    amount: 2450,
    type: 'owed',
    badgeColor: '#BF78EF',
    initials: 'RK',
  },
  {
    id: '2',
    name: 'Maya P.',
    group: 'Apartment 3B',
    amount: 950,
    type: 'owed',
    badgeColor: '#21A47D',
    initials: 'MP',
  },
  {
    id: '3',
    name: 'Sam P.',
    group: 'Weekend Trip',
    amount: 210,
    type: 'owe',
    badgeColor: '#FF7848',
    initials: 'SP',
  },
  {
    id: '4',
    name: 'Anisha C.',
    group: 'Hotel',
    amount: 710,
    type: 'owe',
    badgeColor: '#3B82F6',
    initials: 'AC',
  },
];

// GET /api/settlements/balances
const getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('group').sort({ createdAt: -1 });

    // Compute live dynamic balances from real expenses if available
    if (expenses && expenses.length > 0) {
      const balanceMap = {};

      expenses.forEach((exp) => {
        const payer = exp.paidBy?.name || 'You';
        const groupName = exp.group?.name || 'Group';
        const splits = exp.splits || [];

        splits.forEach((s) => {
          if (s.name && s.name !== payer) {
            const key = `${s.name}|${groupName}`;
            if (!balanceMap[key]) {
              const colors = ['#BF78EF', '#21A47D', '#FF7848', '#3B82F6', '#EC4899'];
              const color = colors[Object.keys(balanceMap).length % colors.length];
              balanceMap[key] = {
                id: key,
                name: s.name,
                group: groupName,
                amount: 0,
                type: 'owed', // You're owed by the member who didn't pay
                badgeColor: color,
                initials: s.name.slice(0, 2).toUpperCase(),
              };
            }
            balanceMap[key].amount += Math.round(s.amount || 0);
          }
        });
      });

      const liveBalances = Object.values(balanceMap).filter((b) => b.amount > 0);
      if (liveBalances.length > 0) {
        return res.json({ balances: liveBalances });
      }
    }

    res.json({ balances: dynamicBalances });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/settlements
const settleUp = async (req, res) => {
  try {
    const {
      amount = '820.00',
      toUserName = 'Rohan Jain',
      recipientUpi = 'rohan10@upi',
      proofUri = null,
      balanceId = null,
      groupId = null,
    } = req.body;

    const numAmount = parseFloat(amount);

    // Create Settlement in DB
    const settlement = await Settlement.create({
      fromUser: { name: 'You' },
      toUser: { name: toUserName, upiId: recipientUpi },
      amount: numAmount,
      status: 'completed',
      proofUri,
    });

    // Remove or settle the balance
    if (balanceId) {
      dynamicBalances = dynamicBalances.filter((b) => b.id !== balanceId);
    } else {
      // Settle with Rohan
      dynamicBalances = dynamicBalances.filter((b) => !b.name.includes('Rohan'));
    }

    // Find group and log Activity
    const group = groupId
      ? await Group.findById(groupId)
      : await Group.findOne().sort({ createdAt: -1 });

    if (group) {
      await Activity.create({
        group: group._id,
        type: 'settlement',
        title: `Settlement with ${toUserName}`,
        meta: `You paid . ₹${numAmount.toLocaleString()} . Just now`,
        amount: `₹${numAmount.toLocaleString()}`,
        amountColor: 'green',
        iconType: 'settlement',
        badgeBg: '#DCFCE7',
        iconColor: '#166534',
      });
    }

    res.status(201).json({
      message: 'Settlement completed successfully',
      settlement,
      remainingBalances: dynamicBalances,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/settlements/settle-all
const settleAll = async (req, res) => {
  try {
    dynamicBalances = [];
    res.json({ message: 'All balances cleared', balances: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/settlements/recent
const getRecentSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find().sort({ createdAt: -1 }).limit(10);
    if (settlements && settlements.length > 0) {
      const formatted = settlements.map((s) => ({
        id: s._id.toString(),
        name: s.toUser?.name || 'Member',
        amount: s.amount,
        type: 'paid',
        meta: `You paid ₹${(s.amount || 0).toLocaleString()}`,
        status: s.status,
      }));
      return res.json({ settlements: formatted });
    }
    const defaults = [
      { id: '1', name: 'Arohi', amount: 1270, type: 'received', meta: 'Paid you ₹1270' },
      { id: '2', name: 'Virat', amount: 1550, type: 'paid', meta: 'You paid ₹1550' },
    ];
    res.json({ settlements: defaults });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getBalances,
  settleUp,
  settleAll,
  getRecentSettlements,
};
