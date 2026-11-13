import { request } from './api';

export const expenseService = {
  async addExpense(payload) {
    return await request('/expenses', {
      method: 'POST',
      body: payload,
    });
  },

  async getExpensesByGroup(groupId) {
    return await request(`/expenses/group/${groupId}`);
  },

  async trackIntent(payload) {
    return await request('/expenses/intent', {
      method: 'POST',
      body: payload,
    });
  },
};
