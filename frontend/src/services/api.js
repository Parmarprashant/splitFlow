import { Platform } from 'react-native';

const DEFAULT_LAN_URL = 'http://192.168.31.87:3000/api';
const DEFAULT_LOCAL_URL = 'http://localhost:3000/api';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? DEFAULT_LOCAL_URL : DEFAULT_LAN_URL);

let tokenGetter = null;

export const registerTokenGetter = (fn) => {
  tokenGetter = fn;
};

export async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, timeoutMs = 15000 } = options;

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  console.log(`🌐 API ${method} -> ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const token = tokenGetter ? tokenGetter() : null;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    signal: controller.signal,
  };

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);
    clearTimeout(timer);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || `Request failed with status ${res.status}`;
      console.warn(`❌ API Error ${res.status} [${url}]:`, message);
      throw new Error(message);
    }

    const data = await res.json();
    console.log(`✅ API Success [${url}]`);
    return data;
  } catch (error) {
    clearTimeout(timer);
    console.warn(`⚠️ API Fetch Error [${url}]:`, error.message);

    // Automatic dual-port retry fallback (5000 <-> 3000)
    const alternateUrl = url.includes(':5000')
      ? url.replace(':5000', ':3000')
      : url.includes(':3000')
      ? url.replace(':3000', ':5000')
      : null;

    if (alternateUrl) {
      try {
        console.log(`🔄 Attempting alternate port fallback -> ${alternateUrl}`);
        const altConfig = {
          method,
          headers: config.headers,
          body: config.body,
        };
        const altRes = await fetch(alternateUrl, altConfig);
        if (altRes.ok) {
          const altData = await altRes.json();
          console.log(`✅ Alternate Port API Success [${alternateUrl}]`);
          return altData;
        }
      } catch (altErr) {
        console.warn(`⚠️ Alternate port also unreachable:`, altErr.message);
      }
    }

    throw error;
  }
}

export { BASE_URL };
