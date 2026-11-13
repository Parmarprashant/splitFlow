import { request } from './api';

export const groupService = {
  async getGroups() {
    try {
      const data = await request('/groups');
      return data.groups || [];
    } catch (err) {
      console.warn('Failed to fetch groups from backend:', err);
      return [];
    }
  },

  async createGroup(name, type = 'trip', userName = 'Prisha') {
    const data = await request('/groups', {
      method: 'POST',
      body: { name, type, userName },
    });
    return data.group;
  },

  async joinGroup(codeOrLink, userName = 'Prisha') {
    const data = await request('/groups/join', {
      method: 'POST',
      body: { codeOrLink, userName },
    });
    return data.group;
  },

  async getGroup(groupId) {
    if (!groupId || groupId === 'default') return null;
    try {
      const data = await request(`/groups/${groupId}`);
      return data.group;
    } catch (e) {
      return null;
    }
  },

  async addMember(groupId, name) {
    return await request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: { name },
    });
  },

  async getGroupSummary(groupId) {
    const endpoint = groupId && groupId !== 'default' ? `/groups/${groupId}/summary` : '/groups/summary';
    try {
      return await request(endpoint);
    } catch (err) {
      console.warn('Failed to fetch group summary from backend:', err);
      return {
        groupName: 'New Group',
        code: 'GRP101',
        shareUrl: 'https://splitflow.in/join/GRP101',
        totalSpent: 0,
        membersSpend: [{ name: 'You', amount: 0 }],
        highlights: [],
        chips: [
          { label: 'No expenses yet', type: 'green' },
          { label: '1 member', type: 'orange' },
        ],
      };
    }
  },
};
