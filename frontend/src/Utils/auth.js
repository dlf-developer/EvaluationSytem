import {jwtDecode} from "jwt-decode";
import { recordRoleSwitchAudit } from "./auditLogger";



export const getToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }
      return token;
    } catch (e) {
      localStorage.removeItem("token");
      return null;
    }
  }
  return null;
};

export const isDualRoleUser = (user) => {
  if (!user) return false;
  return (
    user.isDualRole === true ||
    user.isDualRole === "true" ||
    user.access === "OT" ||
    (Array.isArray(user.roles) &&
      user.roles.includes("Observer") &&
      user.roles.includes("Teacher"))
  );
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
      const isDual =
        decoded?.isDualRole ||
        (Array.isArray(decoded?.roles) && decoded.roles.length > 1);
      const saved = localStorage.getItem("activeRole");
      if (isDual && saved && ["Observer", "Teacher"].includes(saved)) {
        return saved;
      }
      return decoded?.access || null;
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
    const isDual =
      decoded?.isDualRole ||
      (Array.isArray(decoded?.roles) &&
        decoded.roles.includes("Observer") &&
        decoded.roles.includes("Teacher"));
    decoded.isDualRole = !!isDual;
    decoded.primaryAccess = decoded.access;
    if (isDual && typeof window !== "undefined") {
      const saved = localStorage.getItem("activeRole");
      if (saved && ["Observer", "Teacher"].includes(saved)) {
        decoded.access = saved;
        decoded.activeRole = saved;
      } else {
        decoded.activeRole = decoded.access;
      }
    } else {
      decoded.activeRole = decoded.access;
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
