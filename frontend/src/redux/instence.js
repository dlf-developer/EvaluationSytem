import axios from 'axios';
import { baseURL } from '../config/config';
import { getToken, getActiveRole } from '../Utils/auth';
import { frontendLogger } from '../Utils/logger';

// Helper to attach logging interceptors to an axios instance
function attachLoggingInterceptors(instance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config || {};
      const response = error.response || {};
      const status = response.status || 'NETWORK_ERROR';
      const url = config.url || 'unknown';
      const method = (config.method || 'GET').toUpperCase();

      // Don't loop if the failing request is the log upload itself
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

function attachAuthInterceptors(instance) {
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
  return instance;
}

export const axiosInstance = attachLoggingInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

export const axiosInstanceToken = attachAuthInterceptors(
  attachLoggingInterceptors(
    axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  )
);

export const axiosInstanceTokenFormData = attachAuthInterceptors(
  attachLoggingInterceptors(
    axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  )
);

