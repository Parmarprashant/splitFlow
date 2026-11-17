const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Group = require('../models/group.model');
const Expense = require('../models/expense.model');
const Activity = require('../models/activity.model');
const Settlement = require('../models/settlement.model');
const { defaultActivities } = require('./activity.controller');

const seedData = async (req, res) => {
  try {
    // 1. Seed or ensure default user
    let user = await User.findOne({ email: 'prisha@splitflow.in' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: 'Prisha Oberoi',
        email: 'prisha@splitflow.in',
        password: hashedPassword,
        upiId: 'prisha@upi',
        bankAccount: 'HDFC Bank ****2016',
        gentleReminders: true,
      });
    }

    // 2. Clear previous seeded groups, expenses, activities, settlements
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Activity.deleteMany({});
    await Settlement.deleteMany({});

    // 3. Create Finland Trip Group
    const finlandGroup = await Group.create({
      name: 'Finland Trip',
      type: 'trip',
      code: 'FIN482',
      createdBy: user._id,
      members: [
        { user: user._id, name: 'You', initials: 'PO', badgeColor: '#BF78EF' },
        { name: 'Rohan', initials: 'RK', badgeColor: '#BF78EF' },
        { name: 'Maya', initials: 'MP', badgeColor: '#21A47D' },
        { name: 'Sam', initials: 'SP', badgeColor: '#FF7848' },
      ],
    });

    // Create other groups
    await Group.create([
      {
        name: 'Apartment 3B',
        type: 'rent',
        code: 'APT301',
        createdBy: user._id,
        members: [
          { user: user._id, name: 'You', initials: 'PO', badgeColor: '#BF78EF' },
          { name: 'Maya', initials: 'MP', badgeColor: '#21A47D' },
        ],
      },
      {
        name: 'Weekend Trip',
        type: 'trip',
        code: 'WEE210',
        createdBy: user._id,
        members: [
          { user: user._id, name: 'You', initials: 'PO', badgeColor: '#BF78EF' },
          { name: 'Sam', initials: 'SP', badgeColor: '#FF7848' },
        ],
      },
    ]);

    // 4. Create Initial Expenses
    await Expense.create([
      {
        group: finlandGroup._id,
        amount: 7450,
        description: 'Dinner at Savotta Cafe',
        category: 'dinner',
        paidBy: { user: user._id, name: 'You' },
        splits: [
          { name: 'You', amount: 1862.5 },
          { name: 'Rohan', amount: 1862.5 },
          { name: 'Maya', amount: 1862.5 },
          { name: 'Sam', amount: 1862.5 },
        ],
      },
      {
        group: finlandGroup._id,
        amount: 12820,
        description: 'Flight tickets',
        category: 'travel',
        paidBy: { name: 'Maya' },
        splits: [
          { name: 'You', amount: 3205 },
          { name: 'Rohan', amount: 3205 },
          { name: 'Maya', amount: 3205 },
          { name: 'Sam', amount: 3205 },
        ],
      },
      {
        group: finlandGroup._id,
        amount: 9500,
        description: 'Going to Husky sledding',
        category: 'miscellaneous',
        paidBy: { user: user._id, name: 'You' },
        splits: [
          { name: 'You', amount: 2375 },
          { name: 'Rohan', amount: 2375 },
          { name: 'Maya', amount: 2375 },
          { name: 'Sam', amount: 2375 },
        ],
      },
      {
        group: finlandGroup._id,
        amount: 2500,
        description: 'Going shopping for trip',
        category: 'shopping',
        paidBy: { name: 'Sam' },
        splits: [
          { name: 'You', amount: 625 },
          { name: 'Rohan', amount: 625 },
          { name: 'Maya', amount: 625 },
          { name: 'Sam', amount: 625 },
        ],
      },
    ]);

    // 5. Seed Activities
    const activitiesToInsert = defaultActivities.map((act) => ({
      group: finlandGroup._id,
      type: act.iconType === 'settlement' || act.iconType === 'transfer' ? 'settlement' : 'expense',
      title: act.title,
      meta: act.meta,
      amount: act.amount,
      amountColor: act.amountColor,
      iconType: act.iconType,
      badgeBg: act.badgeBg,
      iconColor: act.iconColor,
    }));

    await Activity.insertMany(activitiesToInsert);

    // 6. Seed Recent Settlements
    await Settlement.create([
      {
        group: finlandGroup._id,
        fromUser: { name: 'Arohi' },
        toUser: { name: 'You', upiId: 'prisha@upi' },
        amount: 1270,
        status: 'completed',
      },
      {
        group: finlandGroup._id,
        fromUser: { name: 'You' },
        toUser: { name: 'Virat', upiId: 'virat@upi' },
        amount: 1550,
        status: 'completed',
      },
    ]);

    res.json({
      message: 'MongoDB database successfully seeded with initial SplitFlow data! 🚀',
      group: finlandGroup,
    });
  } catch (err) {
    res.status(500).json({ message: 'Seed error', error: err.message });
  }
};

module.exports = { seedData };
