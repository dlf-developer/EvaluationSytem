import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserId } from "../Utils/auth";
import { fetchMyPermissionsApi } from "../redux/permissionsApi";
import { isAdminFeaturesUnlocked } from "../Utils/adminUnlock";

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const userData = getUserId();
  const userRole = userData?.access;
  const userId = userData?.id || userData?._id;

  const [permissions, setPermissions] = useState(() => {
    try {
      const cached = localStorage.getItem("dlf_effective_permissions");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => isAdminFeaturesUnlocked());

  useEffect(() => {
    const handleUnlockChange = (e) => {
      setIsAdminUnlocked(Boolean(e.detail?.unlocked));
    };
    window.addEventListener("admin-features-unlock-changed", handleUnlockChange);
    return () => window.removeEventListener("admin-features-unlock-changed", handleUnlockChange);
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (!userRole) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchMyPermissionsApi();
      if (data) {
        setPermissions(data);
        try {
          localStorage.setItem("dlf_effective_permissions", JSON.stringify(data));
        } catch {
          // ignore storage error
        }
      }
    } catch (err) {
      console.warn("[PermissionsContext] Failed to load permissions:", err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions, userId, userRole]);

  /**
   * Check if user is allowed to access a given navigation route/tab
   */
  const hasTabAccess = useCallback(
    (routePath) => {
      if (!routePath) return true;

      // Sensitive Admin tabs require PIN unlock
      if (["/audit-logs", "/analytics-insights", "/permissions"].includes(routePath)) {
        if (userRole !== "Superadmin") return false;
        return isAdminUnlocked;
      }

      // If Superadmin, allow unless explicitly turned off
      if (userRole === "Superadmin") {
        if (permissions?.tabs?.[routePath] === false) return false;
        return true;
      }

      // Check resolved tabs configuration
      if (permissions?.tabs && permissions.tabs[routePath] !== undefined) {
        return Boolean(permissions.tabs[routePath]);
      }

      // Defaults based on role if API is still loading
      if (userRole === "Observer") {
        const observerAllowed = [
          "/dashboard",
          "/reports",
          "/profile",
          "/fortnightly-monitor",
          "/classroom-walkthrough",
          "/notebook-checking-proforma",
          "/co-scholastic",
          "/weekly4form",
          "/wing-coordinator",
          "/accountability",
          "/best-practices",
        ];
        return observerAllowed.includes(routePath);
      }

      if (userRole === "Teacher") {
        const teacherAllowed = [
          "/dashboard",
          "/profile",
          "/fortnightly-monitor",
          "/classroom-walkthrough",
          "/notebook-checking-proforma",
          "/co-scholastic",
          "/weekly4form",
          "/best-practices",
        ];
        return teacherAllowed.includes(routePath);
      }

      return false;
    },
    [userRole, permissions, isAdminUnlocked]
  );

  /**
   * Check if user can perform a specific document operation
   * @param {string} docType - e.g. 'fortnightly', 'bestPractices', 'notebook', etc.
   * @param {string} action - 'canDelete' | 'canEdit' | 'canCreate' | 'canExport' | 'canView'
   */
  const canPerform = useCallback(
    (docType, action) => {
      if (!docType || !action) return false;

      // Audit logs are tamper-proof immutable
      if (docType === "auditLogs" && (action === "canDelete" || action === "canEdit")) {
        return false;
      }

      // Check resolved document action permissions
      const docPerms = permissions?.documents?.[docType];
      if (docPerms && docPerms[action] !== undefined) {
        return Boolean(docPerms[action]);
      }

      // Fallback defaults: Superadmin allowed by default
      if (userRole === "Superadmin") return true;

      // Observer default: canCreate, canEdit, canExport (no canDelete)
      if (userRole === "Observer") {
        if (action === "canDelete") return false;
        if (["canView", "canCreate", "canEdit", "canExport"].includes(action)) return true;
      }

      // Teacher default: canView, canCreate, canEdit (no canDelete, no canExport)
      if (userRole === "Teacher") {
        if (action === "canDelete" || action === "canExport") return false;
        if (["canView", "canCreate", "canEdit"].includes(action)) return true;
      }

      return false;
    },
    [userRole, permissions]
  );

  const value = {
    permissions,
    loading,
    isAdminUnlocked,
    hasTabAccess,
    canPerform,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    // Return safe fallback helpers if called outside Provider
    return {
      permissions: null,
      loading: false,
      isAdminUnlocked: false,
      hasTabAccess: () => true,
      canPerform: (_doc, action) => action !== "canDelete",
      refreshPermissions: () => {},
    };
  }
  return context;
};
