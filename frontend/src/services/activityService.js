import { request } from './api';

export const activityService = {
  async getActivities(groupId) {
    const endpoint = groupId ? `/activities/group/${groupId}` : '/activities';
    try {
      const data = await request(endpoint);
      return data.activities || [];
    } catch (err) {
      console.warn('Failed to fetch activities, using fallback:', err);
      return [
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
    }
  },

  async createActivity(payload) {
    return await request('/activities', {
      method: 'POST',
      body: payload,
    });
  },
};
