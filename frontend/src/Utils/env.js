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

/**
 * Detects which school portal (DLWS or DLPS) the app is running for.
 * Priority:
 * 1. Explicit env override (`REACT_APP_SCHOOL` = "DLWS" | "DLPS")
 * 2. Configured API URL (`REACT_APP_API_URL` containing "dlws" or "dlps")
 * 3. Browser hostname (`window.location.hostname` containing "dlws" or "dlps")
 * 4. Optional backend-provided portal hint (useful when testing locally against switched DBs)
 * 5. Safe default ("DLPS")
 */
export const detectConfiguredSchoolPortal = () => {
  const explicitSchool = (process.env.REACT_APP_SCHOOL || "").trim().toUpperCase();
  if (explicitSchool === "DLWS" || explicitSchool === "DLPS") {
    return explicitSchool;
  }

  const apiUrl = (process.env.REACT_APP_API_URL || "").toLowerCase();
  if (apiUrl.includes("dlws")) return "DLWS";
  if (apiUrl.includes("dlps")) return "DLPS";

  if (typeof window !== "undefined") {
    const host = (window.location.hostname || "").toLowerCase();
    if (host.includes("dlws")) return "DLWS";
    if (host.includes("dlps")) return "DLPS";
  }

  return null;
};

export const getSchoolPortal = (backendHint) => {
  const configured = detectConfiguredSchoolPortal();
  if (configured) return configured;

  const hint = typeof backendHint === "string" ? backendHint.trim().toUpperCase() : "";
  if (hint === "DLWS" || hint === "DLPS") {
    return hint;
  }

  return "DLPS";
};

export const isDLWS = (backendHint) => getSchoolPortal(backendHint) === "DLWS";
export const isDLPS = (backendHint) => getSchoolPortal(backendHint) === "DLPS";

export default isDevOrLocalEnv;

