/**
 * Utility to detect if the application is running in LOCAL or DEV ENVIRONMENT mode.
 * The Audit Tab is only visible in Local / Dev environments.
 * In Production, audit tracking runs live in the background, but the tab is hidden from users.
 */
export const isDevOrLocalEnv = () => {
  if (typeof window === 'undefined') return false;
  const hostname = (window.location.hostname || '').toLowerCase();

  // 1. Explicit development build mode or environment variable
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.REACT_APP_ENV === 'development' ||
    process.env.REACT_APP_ENV === 'dev'
  ) {
    return true;
  }

  // 2. Localhost and loopback IPs (any port)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    return true;
  }

  // 3. Known dev, staging, or preview domains
  if (
    hostname.includes('dev.') ||
    hostname.includes('-dev.') ||
    hostname.includes('staging.') ||
    hostname.includes('-staging.') ||
    hostname.includes('preview.') ||
    hostname.includes('sandbox.') ||
    hostname.startsWith('dev-') ||
    hostname.startsWith('staging-')
  ) {
    return true;
  }

  return false;
};

export const isLocalDev = isDevOrLocalEnv;
export default isDevOrLocalEnv;

