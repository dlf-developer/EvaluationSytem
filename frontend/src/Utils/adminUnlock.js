// Secret Admin PIN Unlock Engine
// Allows Superadmin to access Audit Logs and Admin Analytics in Production and Dev
export const ADMIN_SECRET_PIN = "1111";
export const ADMIN_UNLOCK_STORAGE_KEY = "admin_features_unlocked_pin";

export const isAdminFeaturesUnlocked = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY) === "true";
};

export const setAdminFeaturesUnlocked = (unlocked) => {
  if (typeof window === "undefined") return;
  const isUnlocked = Boolean(unlocked);
  localStorage.setItem(ADMIN_UNLOCK_STORAGE_KEY, isUnlocked ? "true" : "false");

  // Broadcast event across all components (Sidebar, Dashboard, Navbar, etc.)
  window.dispatchEvent(
    new CustomEvent("admin-features-unlock-changed", {
      detail: { unlocked: isUnlocked },
    })
  );
};

