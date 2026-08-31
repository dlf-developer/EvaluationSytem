import axios from 'axios';
import { baseURL } from '../config/config';
import { getToken } from '../Utils/auth';
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

export const axiosInstance = attachLoggingInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

const token = getToken();

export const axiosInstanceToken = attachLoggingInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
);

export const axiosInstanceTokenFormData = attachLoggingInterceptors(
  axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  })
);

