import { request, registerTokenGetter } from './api';

let storedToken = null;

export const setAuthToken = (token) => {
  storedToken = token;
};

export const getAuthToken = () => storedToken;

registerTokenGetter(getAuthToken);

export const authService = {
  async register(name, email, password) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (res?.accessToken) {
      setAuthToken(res.accessToken);
    }
    return res;
  },

  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res?.accessToken) {
      setAuthToken(res.accessToken);
    }
    return res;
  },

  async getProfile() {
    return await request('/auth/profile');
  },

  async updateProfile(data) {
    return await request('/auth/profile', {
      method: 'PUT',
      body: data,
    });
  },
};
