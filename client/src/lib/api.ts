import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return `Cannot reach the API server. Make sure the backend is running at ${apiBaseUrl}.`;
  }

  if ([500, 502, 503, 504].includes(error.response.status)) {
    return 'The server or database may still be starting. Wait a moment, then try again.';
  }

  const message = error.response.data?.message;
  if (Array.isArray(message)) {
    return message.join(' ');
  }

  return message || fallback;
}

export default api;
