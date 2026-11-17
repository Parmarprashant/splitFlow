const Activity = require('../models/activity.model');
const Group = require('../models/group.model');

const defaultActivities = [
  {
    _id: 'act-1',
    title: 'Dinner at Savotta Cafe',
    meta: 'You added . ₹2,450 . 2 hours ago',
    amount: '₹7,450',
    amountColor: 'purple',
    iconType: 'food',
    badgeBg: '#FEF3C7',
    iconColor: '#92400E',
  },
  {
    _id: 'act-2',
    title: 'Settlement with Rohan',
    meta: 'Rohan paid you . ₹1,200 . 11 hours ago',
    amount: '₹1,200',
    amountColor: 'green',
    iconType: 'settlement',
    badgeBg: '#DCFCE7',
    iconColor: '#166534',
  },
  {
    _id: 'act-3',
    title: 'Going to Husky sledding',
    meta: 'You added . ₹9,500 . 1 days ago',
    amount: '₹9,500',
    amountColor: 'purple',
    iconType: 'sledding',
    badgeBg: '#EDE9FE',
    iconColor: '#6D28D9',
  },
  {
    _id: 'act-4',
    title: 'Flight tickets',
    meta: 'Maya added . ₹12,820 . 4 days ago',
    amount: '₹12,820',
    amountColor: 'green',
    iconType: 'flight',
    badgeBg: '#FFEDD5',
    iconColor: '#9A3412',
  },
  {
    _id: 'act-5',
    title: 'You paid Virat',
    meta: 'Settled taxi fare . ₹850 . 1 week ago',
    amount: '₹850',
    amountColor: 'purple',
    iconType: 'transfer',
    badgeBg: '#DCFCE7',
    iconColor: '#166534',
  },
  {
    _id: 'act-6',
    title: 'Going shopping for trip',
    meta: 'Sam added . ₹2,500 . 1 week ago',
    amount: '₹2,500',
    amountColor: 'green',
    iconType: 'shopping',
    badgeBg: '#E0E7FF',
    iconColor: '#3730A3',
  },
];

// GET /api/activities or /api/activities/group/:groupId
const getActivities = async (req, res) => {
  try {
    const { groupId } = req.params;
    let query = {};
    if (groupId && groupId !== 'default') {
      query.group = groupId;
    }

    let activities = [];
    try {
      activities = await Activity.find(query).sort({ createdAt: -1 });
    } catch (e) {
      // If collection query fails or DB is empty, we fall back
      activities = [];
    }

    if (!activities || activities.length === 0) {
      return res.json({ activities: defaultActivities, total: defaultActivities.length });
    }

    res.json({ activities, total: activities.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/activities
const createActivity = async (req, res) => {
  try {
    const {
      groupId,
      type = 'expense',
      title,
      meta,
      amount,
      amountColor = 'purple',
      iconType = 'food',
      badgeBg = '#FEF3C7',
      iconColor = '#92400E',
    } = req.body;

    if (!title || !meta || !amount) {
      return res.status(400).json({ message: 'Title, meta, and amount are required' });
    }

    let group = null;
    if (groupId) {
      group = await Group.findById(groupId);
    }
    if (!group) {
      group = await Group.findOne().sort({ createdAt: -1 });
    }

    const activity = await Activity.create({
      group: group ? group._id : null,
      type,
      title,
      meta,
      amount,
      amountColor,
      iconType,
      badgeBg,
      iconColor,
    });

    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getActivities,
  createActivity,
  defaultActivities,
};
