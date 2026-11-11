import {jwtDecode} from "jwt-decode";
import { recordRoleSwitchAudit } from "./auditLogger";



export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || null;
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken") || null;
  }
  return null;
};

export const setTokens = (accessToken, refreshToken = null) => {
  if (typeof window !== "undefined") {
    if (accessToken) localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
  }
};

export const normalizeUserAccess = (access) => {
  if (access === "OT") return "Observer";
  return access || "";
};

export const isDualRoleUser = (user) => {
  if (!user) return false;
  const rawAccess = user.access || user.primaryAccess || user.role || user.roleName;
  const normalizedAccess = normalizeUserAccess(rawAccess);
  if (normalizedAccess && normalizedAccess !== "Observer") return false;
  return (
    user.isDualRole === true ||
    user.isDualRole === "true" ||
    user.access === "OT" ||
    user.role === "OT" ||
    (Array.isArray(user.roles) &&
      user.roles.includes("Observer") &&
      user.roles.includes("Teacher"))
  );
};

export const buildUserRolePayload = ({ access, isDualRole, canAddNotebookComment }) => {
  const normalizedAccess = normalizeUserAccess(access) || "Observer";
  const isObserver = normalizedAccess === "Observer";
  const resolvedDualRole = isObserver && Boolean(isDualRole);
  const resolvedCommentAccess = isObserver && Boolean(canAddNotebookComment);
  return {
    access: normalizedAccess,
    isDualRole: resolvedDualRole,
    canAddNotebookComment: resolvedCommentAccess,
    roles: resolvedDualRole ? ["Observer", "Teacher"] : [normalizedAccess],
  };
};

export const isTeacherEligible = (user) => {
  if (!user || user.isActive === false) return false;
  return (
    user.access === "Teacher" ||
    user.access === "OT" ||
    isDualRoleUser(user) ||
    (Array.isArray(user.roles) && user.roles.includes("Teacher"))
  );
};

export const isObserverEligible = (user) => {
  if (!user || user.isActive === false) return false;
  return (
    user.access === "Observer" ||
    user.access === "OT" ||
    isDualRoleUser(user) ||
    (Array.isArray(user.roles) && user.roles.includes("Observer"))
  );
};

export const getUserRoleTag = (user) => {
  if (!user) return "";
  if (isDualRoleUser(user)) return "OT";
  if (user.access === "Teacher") return "T";
  if (user.access === "Observer") return "O";
  if (user.access === "Superadmin") return "Superadmin";
  return user.access || "";
};

export const getActiveRole = () => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const baseAccess = normalizeUserAccess(decoded?.access);
      const isDual = isDualRoleUser(decoded);
      const saved = localStorage.getItem("activeRole");
      if (isDual && saved && ["Observer", "Teacher"].includes(saved)) {
        return saved;
      }
      return baseAccess || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const switchActiveRole = (newRole) => {
  if (typeof window !== "undefined") {
    if (["Observer", "Teacher"].includes(newRole)) {
      const oldRole = localStorage.getItem("activeRole");
      localStorage.setItem("activeRole", newRole);
      try {
        recordRoleSwitchAudit({ fromRole: oldRole, toRole: newRole });
      } catch (e) {
        // ignore
      }
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 50);
    }
  }
};

export const getUserId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    decoded.id = decoded.id || decoded._id || decoded.userId;
    decoded.email = decoded.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : "");
    decoded.canAddNotebookComment = Boolean(
      decoded.canAddNotebookComment === true ||
      decoded.canAddNotebookComment === "true"
    );
    const isDual = isDualRoleUser(decoded);
    const normalizedAccess = normalizeUserAccess(decoded?.access);
    decoded.isDualRole = !!isDual;
    decoded.primaryAccess = normalizedAccess;
    decoded.access = normalizedAccess;
    if (isDual && typeof window !== "undefined") {
      const saved = localStorage.getItem("activeRole");
      if (saved && ["Observer", "Teacher"].includes(saved)) {
        decoded.access = saved;
        decoded.activeRole = saved;
      } else {
        decoded.activeRole = normalizedAccess;
      }
    } else {
      decoded.activeRole = normalizedAccess;
    }
    return decoded;
  } catch (e) {
    return null;
  }
};

export const getAllTimes = (timestamp) => {
  const dateTime = new Date(timestamp);

  const pad = (number) => number.toString().padStart(2, '0');

  const year = dateTime.getFullYear();
  const month = pad(dateTime.getMonth() + 1);
  const day = pad(dateTime.getDate());

  const hours = pad(dateTime.getHours());
  const minutes = pad(dateTime.getMinutes());
  const seconds = pad(dateTime.getSeconds());

  const timezoneOffsetMinutes = dateTime.getTimezoneOffset();
  const timezoneOffsetSign = timezoneOffsetMinutes > 0 ? '-' : '+';
  const timezoneOffsetHours = pad(Math.floor(Math.abs(timezoneOffsetMinutes) / 60));
  const timezoneOffsetMinutesAdjusted = pad(Math.abs(timezoneOffsetMinutes) % 60);

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    formattedDate: `${year}-${month}-${day}`,
    formattedDate2: `${day}-${month}-${year}`,
    formattedTime: `${hours}:${minutes}:${seconds}`,
    formattedTimezone: `${timezoneOffsetSign}${timezoneOffsetHours}:${timezoneOffsetMinutesAdjusted}`,
  };
};
