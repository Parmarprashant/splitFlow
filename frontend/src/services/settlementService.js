import { request } from './api';

export const settlementService = {
  async getBalances() {
    try {
      const data = await request('/settlements/balances');
      return data.balances;
    } catch (err) {
      console.warn('Failed to fetch balances from backend, using fallback:', err);
      return [
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
    }
  },

  async settleUp(payload) {
    return await request('/settlements', {
      method: 'POST',
      body: payload,
    });
  },

  async settleAll() {
    return await request('/settlements/settle-all', {
      method: 'POST',
    });
  },

  async getRecentSettlements() {
    try {
      const data = await request('/settlements/recent');
      return data.settlements;
    } catch (err) {
      console.warn('Failed to fetch recent settlements, using fallback:', err);
      return [
        { id: '1', name: 'Arohi', amount: 1270, meta: 'Paid you ₹1270' },
        { id: '2', name: 'Virat', amount: 1550, meta: 'You paid ₹1550' },
      ];
    }
  },
};
