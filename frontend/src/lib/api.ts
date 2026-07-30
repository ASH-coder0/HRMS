import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

const REFRESH_TOKEN_KEY = 'hrms_refresh_token';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return null;
  try {
    const res = await api.post('/auth/refresh', { refresh_token });
    const { access_token, refresh_token: newRefreshToken } = res.data.data;
    setAccessToken(access_token);
    setRefreshToken(newRefreshToken);
    return access_token as string;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => (refreshPromise = null));
      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};
