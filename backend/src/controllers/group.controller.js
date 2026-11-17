const Group = require('../models/group.model');
const Expense = require('../models/expense.model');
const Activity = require('../models/activity.model');

// POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, type = 'trip' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const userName = req.user?.name || req.body.userName || 'Prisha';
    const userId = req.user?.id || null;

    // Generate random code like "GOA482"
    const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GRP';
    const randomCode = `${prefix}${Math.floor(100 + Math.random() * 900)}`;

    const group = await Group.create({
      name: name.trim(),
      type: type.toLowerCase(),
      code: randomCode,
      createdBy: userId,
      members: [
        {
          user: userId,
          name: userName,
          initials: userName.slice(0, 2).toUpperCase(),
          badgeColor: '#BF78EF',
        },
      ],
    });

    // Log Activity
    await Activity.create({
      group: group._id,
      type: 'expense',
      title: `${name} Group Created`,
      meta: `Created by ${userName} . Just now`,
      amount: '₹0',
      amountColor: 'green',
      iconType: 'sledding',
      badgeBg: '#EDE9FE',
      iconColor: '#6D28D9',
    });

    res.status(201).json({ group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/groups/join
const joinGroup = async (req, res) => {
  try {
    const { codeOrLink, userName = 'Prisha' } = req.body;

    if (!codeOrLink || !codeOrLink.trim()) {
      return res.status(400).json({ message: 'Group code or link is required' });
    }

    // Extract code from URL if link provided: "https://splitflow.in/join/XYZ789" -> "XYZ789"
    const cleanCode = codeOrLink.trim().split('/').pop().toUpperCase();

    const group = await Group.findOne({
      $or: [{ code: cleanCode }, { code: codeOrLink.trim().toUpperCase() }],
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found with this code or link' });
    }

    // Check if already member
    const alreadyMember = group.members.some(
      (m) => m.name.toLowerCase() === userName.toLowerCase()
    );

    if (!alreadyMember) {
      group.members.push({
        user: req.user?.id || null,
        name: userName,
        initials: userName.slice(0, 2).toUpperCase(),
        badgeColor: '#21A47D',
      });
      await group.save();
    }

    res.json({ message: 'Successfully joined group', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/groups/:id
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/groups/:id/summary
const getGroupSummary = async (req, res) => {
  try {
    const { id } = req.params;
    let group = null;

    if (id && id !== 'default') {
      try {
        group = await Group.findById(id);
      } catch (e) {
        group = null;
      }
    }

    if (!group) {
      // Find the most recently created group
      group = await Group.findOne().sort({ createdAt: -1 });
    }

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const expenses = await Expense.find({ group: group._id }).sort({ createdAt: -1 });

    // Calculate real total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Calculate real member spending breakdown based on group.members
    const memberTotals = {};
    (group.members || []).forEach((m) => {
      memberTotals[m.name] = 0;
    });

    expenses.forEach((exp) => {
      const payerName = exp.paidBy?.name || 'You';
      memberTotals[payerName] = (memberTotals[payerName] || 0) + exp.amount;
    });

    const membersSpend = Object.keys(memberTotals).map((name) => ({
      name,
      amount: Math.round(memberTotals[name]),
    }));

    // If there are real expenses, compute dynamic highlights from actual data
    let highlights = [];
    if (expenses.length > 0) {
      // Top expense
      const topExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
      if (topExpense) {
        highlights.push({
          title: `${topExpense.paidBy.name} paid ₹${topExpense.amount.toLocaleString()} for ${topExpense.description}`,
          description: `Highest expense in ${group.name} so far. Split among ${group.members.length || 1} member(s).`,
          badgeInitials: (topExpense.paidBy.name || 'U').slice(0, 2).toUpperCase(),
          badgeColor: '#BF78EF',
        });
      }

      // If more than 1 expense, show second highlight
      if (expenses.length > 1) {
        const secondExpense = [...expenses].sort((a, b) => b.amount - a.amount)[1];
        highlights.push({
          title: `${secondExpense.paidBy.name} paid for ${secondExpense.description}`,
          description: `₹${secondExpense.amount.toLocaleString()} recorded for ${secondExpense.category || 'shared expense'}.`,
          badgeInitials: (secondExpense.paidBy.name || 'U').slice(0, 2).toUpperCase(),
          badgeColor: '#1941A3',
        });
      }
    }

    const shareUrl = `https://splitflow.in/join/${group.code}`;

    res.json({
      groupId: group._id,
      groupName: group.name,
      groupType: group.type,
      code: group.code,
      shareUrl,
      memberCount: group.members.length,
      createdAt: group.createdAt,
      totalSpent,
      membersSpend,
      highlights,
      chips: [
        { label: totalSpent === 0 ? 'No expenses yet' : 'All caught up', type: 'green' },
        { label: `${group.members.length} member${group.members.length === 1 ? '' : 's'}`, type: 'orange' },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/groups/:id/members
const addMemberToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Member name is required' });
    }
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const trimmed = name.trim();
    const already = group.members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    if (!already) {
      const colors = ['#BF78EF', '#21A47D', '#FF7848', '#3B82F6', '#EC4899', '#F59E0B'];
      const randomColor = colors[group.members.length % colors.length];
      group.members.push({
        name: trimmed,
        initials: trimmed.slice(0, 2).toUpperCase(),
        badgeColor: randomColor,
      });
      await group.save();
    }
    res.json({ message: 'Member added successfully', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getGroups,
  getGroupById,
  getGroupSummary,
  addMemberToGroup,
};
