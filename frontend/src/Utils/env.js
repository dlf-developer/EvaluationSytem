/**
 * Utility to detect if the application is running in LOCAL DEVELOPMENT mode.
 */
export const isLocalDev = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const port = window.location.port;

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    port === '3000' ||
    port === '3001' ||
    process.env.NODE_ENV === 'development'
  );
};

