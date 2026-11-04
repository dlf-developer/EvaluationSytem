import axios from 'axios';
import { baseURL } from '../config/config';
import { getToken, getRefreshToken, setTokens, clearTokens, getActiveRole } from '../Utils/auth';
import { frontendLogger } from '../Utils/logger';

// Refresh Token Concurrency Mutex & Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to attach logging & security interceptors to an axios instance
function attachSecurityInterceptors(instance) {
  // Request Interceptor: Attach Token & Active Role
  instance.interceptors.request.use(
    (config) => {
      const currentToken = getToken();
      if (currentToken) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${currentToken}`;
      }
      const activeRole = getActiveRole();
      if (activeRole) {
        config.headers = config.headers || {};
        config.headers['x-active-role'] = activeRole;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Auto-Refresh 7d Token, Inactivity Lockout, Broken Token Rejection
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const response = error.response || {};
      const status = response.status;
      const data = response.data || {};
      const url = originalRequest.url || '';

      // ── 1. Real-Time Inactivity Guard (HTTP 403 / ACCOUNT_INACTIVE) ──────
      if (status === 403 && (data.isInactive === true || data.code === 'ACCOUNT_INACTIVE')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('account-deactivated', {
              detail: {
                message:
                  data.message ||
                  'Your account has been deactivated by the administrator. All active sessions have been terminated.',
              },
            })
          );
        }
        return Promise.reject(error);
      }

      // ── 2. Broken / Tampered Token Rejection (HTTP 401 INVALID_TOKEN) ────
      if (status === 401 && (data.code === 'INVALID_TOKEN' || data.code === 'TOKEN_REVOKED')) {
        clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }

      // ── 3. Expired Access Token Auto-Refresh (HTTP 401 TOKEN_EXPIRED) ────
      if (
        status === 401 &&
        (data.code === 'TOKEN_EXPIRED' || data.message?.includes('jwt expired')) &&
        !originalRequest._retry &&
        !url.includes('/auth/refresh-token') &&
        !url.includes('/auth/login')
      ) {
        if (isRefreshing) {
          // If a refresh is already in flight, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const storedRefreshToken = getRefreshToken();
        if (!storedRefreshToken) {
          clearTokens();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.replace('/login');
          }
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          // Call the 30-day refresh endpoint using raw axios to avoid interceptor recursion
          const refreshRes = await axios.post(`${baseURL}/auth/refresh-token`, {
            refreshToken: storedRefreshToken,
          });

          if (refreshRes.data?.success && refreshRes.data?.token) {
            const newAccessToken = refreshRes.data.token;
            const newRefreshToken = refreshRes.data.refreshToken;

            setTokens(newAccessToken, newRefreshToken);

            // Replay all queued requests with the new token
            processQueue(null, newAccessToken);

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          } else {
            throw new Error('Refresh response invalid');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          clearTokens();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.replace('/login');
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // ── 4. Logging Interceptor ──────────────────────────────────────────
      const method = (originalRequest.method || 'GET').toUpperCase();
      if (!url.includes('/logs/frontend')) {
        frontendLogger.error(`API Error [${method} ${url}] Status: ${status} - ${error.message}`, {
          url,
          method,
          status,
          responseData: response.data,
          message: error.message,
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export const axiosInstance = attachSecurityInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

export const axiosInstanceToken = attachSecurityInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

export const axiosInstanceTokenFormData = attachSecurityInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
);
