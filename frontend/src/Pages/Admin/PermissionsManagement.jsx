import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  KeyRound,
  Check,
  X,
  RotateCcw,
  Save,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Download,
  Trash2,
  Edit3,
  PlusCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { getUserId } from "../../Utils/auth";
import {
  isAdminFeaturesUnlocked,
  setAdminFeaturesUnlocked,
} from "../../Utils/adminUnlock";
import AdminPinModal from "../../Components/AdminPinModal";
import {
  fetchPermissionsMatrixApi,
  updateRolePermissionsApi,
  updateUserPermissionsApi,
  resetUserPermissionsApi,
} from "../../redux/permissionsApi";
import { usePermissions } from "../../context/PermissionsContext";

// Document Definitions
const DOCUMENT_SPECS = [
  { key: "fortnightly", label: "Fortnightly Monitor", path: "/fortnightly-monitor" },
  { key: "walkthrough", label: "Classroom Walkthrough", path: "/classroom-walkthrough" },
  { key: "notebook", label: "Notebook Checking Proforma", path: "/notebook-checking-proforma" },
  { key: "coScholastic", label: "Co-Scholastic Observation", path: "/co-scholastic" },
  { key: "weekly4", label: "Learning Progress Checklist (Weekly 4)", path: "/weekly4form" },
  { key: "wingCoordinator", label: "Wing Coordinator Form", path: "/wing-coordinator" },
  { key: "accountability", label: "Accountability Mechanism", path: "/accountability" },
  { key: "bestPractices", label: "Best Practices for Teachers", path: "/best-practices" },
  { key: "users", label: "User Management", path: "/users" },
  { key: "classSection", label: "Class & Section Setup", path: "/class-section" },
  { key: "auditLogs", label: "Audit Logs", path: "/audit-logs", allowDelete: false },
];

// Navigation Tabs Definitions
const TAB_SPECS = [
  { path: "/dashboard", label: "Dashboard", category: "Core" },
  { path: "/reports", label: "Overviews / Reports", category: "Core" },
  { path: "/profile", label: "User Profile", category: "Core" },
  { path: "/fortnightly-monitor", label: "Fortnightly Monitor", category: "Forms" },
  { path: "/classroom-walkthrough", label: "Classroom Walkthrough", category: "Forms" },
  { path: "/notebook-checking-proforma", label: "Notebook Checking", category: "Forms" },
  { path: "/co-scholastic", label: "Co-Scholastic Observation", category: "Forms" },
  { path: "/weekly4form", label: "Learning Progress Checklist", category: "Forms" },
  { path: "/wing-coordinator", label: "Wing Coordinator", category: "Reports" },
  { path: "/accountability", label: "Accountability Mechanism", category: "Reports" },
  { path: "/best-practices", label: "Best Practices", category: "Resources" },
  { path: "/users", label: "User Management", category: "Admin" },
  { path: "/class-section", label: "Class / Section", category: "Admin" },
  { path: "/analytics-insights", label: "Admin Analytics", category: "Admin" },
  { path: "/audit-logs", label: "Audit Logs", category: "Admin" },
  { path: "/permissions", label: "Permissions & Access", category: "Admin" },
];

export default function PermissionsManagement() {
  const currentUser = getUserId();
  const isSuperadmin = currentUser?.access === "Superadmin";
  const { refreshPermissions } = usePermissions();

  const [isUnlocked, setIsUnlocked] = useState(() => isAdminFeaturesUnlocked());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Active Admin Sub-tab (roles vs users)
  const [activeMainTab, setActiveMainTab] = useState("roles"); // "roles" | "users"

  // Role Matrix state
  const [selectedRole, setSelectedRole] = useState("Observer"); // "Superadmin" | "Observer" | "Teacher"
  const [matrixData, setMatrixData] = useState({ roles: {}, userOverrides: [] });
  const [roleTabs, setRoleTabs] = useState({});
  const [roleDocs, setRoleDocs] = useState({});

  // Loading & saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // User Overrides state
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserForOverride, setSelectedUserForOverride] = useState(null);
  const [userOverrideTabs, setUserOverrideTabs] = useState({});
  const [userOverrideDocs, setUserOverrideDocs] = useState({});

  useEffect(() => {
    const handleUnlockChange = (e) => {
      setIsUnlocked(Boolean(e.detail?.unlocked));
    };
    window.addEventListener("admin-features-unlock-changed", handleUnlockChange);
    return () => window.removeEventListener("admin-features-unlock-changed", handleUnlockChange);
  }, []);

  // Fetch full matrix when unlocked
  const loadMatrix = useCallback(async () => {
    if (!isUnlocked) return;
    try {
      setIsLoading(true);
      const data = await fetchPermissionsMatrixApi();
      if (data) {
        setMatrixData(data);
      }
    } catch (err) {
      console.error("[PermissionsManagement] Failed to load matrix:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isUnlocked]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  // Synchronize local role state whenever selectedRole or matrixData changes
  useEffect(() => {
    const roleConfig = matrixData.roles?.[selectedRole] || {};
    setRoleTabs(roleConfig.tabs || {});
    setRoleDocs(roleConfig.documents || {});
  }, [selectedRole, matrixData]);

  // Toggle role tab
  const handleToggleRoleTab = (path) => {
    setRoleTabs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Toggle role document action
  const handleToggleRoleDocAction = (docKey, action) => {
    setRoleDocs((prev) => {
      const current = prev[docKey] || {};
      return {
        ...prev,
        [docKey]: {
          ...current,
          [action]: !current[action],
        },
      };
    });
  };

  // Save role permissions
  const handleSaveRole = async () => {
    try {
      setIsSaving(true);
      await updateRolePermissionsApi(selectedRole, {
        tabs: roleTabs,
        documents: roleDocs,
      });
      setSaveMessage({ type: "success", text: `Permissions updated successfully for ${selectedRole}.` });
      setTimeout(() => setSaveMessage(null), 4000);
      await loadMatrix();
      await refreshPermissions();
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message || "Failed to update role permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  // Open user override drawer
  const handleOpenUserOverride = (userOverrideItem) => {
    const user = userOverrideItem.user;
    setSelectedUserForOverride(user);
    setUserOverrideTabs(userOverrideItem.tabs || {});
    setUserOverrideDocs(userOverrideItem.documents || {});
  };

  // Save user override
  const handleSaveUserOverride = async () => {
    if (!selectedUserForOverride?._id) return;
    try {
      setIsSaving(true);
      await updateUserPermissionsApi(selectedUserForOverride._id, {
        tabs: userOverrideTabs,
        documents: userOverrideDocs,
      });
      setSaveMessage({ type: "success", text: `Custom override saved for ${selectedUserForOverride.name}.` });
      setTimeout(() => setSaveMessage(null), 4000);
      setSelectedUserForOverride(null);
      await loadMatrix();
      await refreshPermissions();
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message || "Failed to save user override." });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset user override
  const handleResetUserOverride = async (userId, userName) => {
    if (!window.confirm(`Reset custom permissions for ${userName || "this user"} back to role defaults?`)) {
      return;
    }
    try {
      setIsSaving(true);
      await resetUserPermissionsApi(userId);
      setSaveMessage({ type: "success", text: `Permissions reset to role defaults for ${userName}.` });
      setTimeout(() => setSaveMessage(null), 4000);
      if (selectedUserForOverride?._id === userId) {
        setSelectedUserForOverride(null);
      }
      await loadMatrix();
      await refreshPermissions();
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message || "Failed to reset user permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-800">Access Restricted</h2>
        <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
          The Permissions & Access Control panel is strictly restricted to system administrators.
        </p>
      </div>
    );
  }

  // ── PIN Locked Gate View ──────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-[#4A6741]/10 text-[#4A6741] mx-auto flex items-center justify-center shadow-xs">
          <Lock className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#2D2A26] tracking-tight">
            Admin Verification Required
          </h2>
          <p className="text-sm text-[#5C5852] mt-2 max-w-md mx-auto leading-relaxed">
            The Permissions & Access Control panel manages user privileges, navigation visibility, and document deletion permissions. Please enter the administrator PIN to unlock.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsPinModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs"
          >
            <KeyRound className="w-4 h-4" />
            <span>Enter Admin PIN (Default: 1111)</span>
          </button>
        </div>

        <AdminPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setIsUnlocked(true);
            loadMatrix();
          }}
        />
      </div>
    );
  }

  // ── Unlocked Full Permissions Management View ─────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 text-[#2D2A26] space-y-6">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A6741]/15 text-[#4A6741] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#2D2A26] tracking-tight">
                Role & User Permissions Management
              </h1>
              <p className="text-xs text-[#5C5852] mt-0.5">
                Manage navigation tabs availability and document creation, editing, and deletion capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Lock Session Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAdminFeaturesUnlocked(false);
              setIsUnlocked(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition"
            title="Lock session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition animate-in fade-in ${
            saveMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Main Mode Tabs (Roles vs Users) */}
      <div className="flex items-center gap-3 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveMainTab("roles")}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeMainTab === "roles"
              ? "border-[#4A6741] text-[#4A6741]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Role-Level Permissions Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("users")}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeMainTab === "users"
              ? "border-[#4A6741] text-[#4A6741]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Individual User Overrides ({matrixData.userOverrides?.length || 0})</span>
        </button>
      </div>

      {/* ── TAB 1: ROLE-LEVEL PERMISSIONS MATRIX ───────────────────── */}
      {activeMainTab === "roles" && (
        <div className="space-y-6">
          {/* Role Selector Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100/80 rounded-2xl max-w-md">
            {["Observer", "Teacher", "Superadmin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition ${
                  selectedRole === r
                    ? "bg-white text-[#4A6741] shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Navigation Tabs Availability */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A26]">
                    Available Sidebar Tabs for {selectedRole}
                  </h3>
                  <p className="text-[11px] text-[#5C5852] mt-0.5">
                    Toggle which sections appear in the sidebar navigation.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {TAB_SPECS.map((tab) => {
                  const isChecked = roleTabs[tab.path] !== false;
                  return (
                    <div
                      key={tab.path}
                      onClick={() => handleToggleRoleTab(tab.path)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-white border-stone-200 hover:border-[#4A6741]/50"
                          : "bg-stone-50 border-stone-200/60 opacity-60"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-[#2D2A26]">
                          {tab.label}
                        </div>
                        <div className="text-[10px] text-[#5C5852] font-mono mt-0.5">
                          {tab.path}
                        </div>
                      </div>

                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                          isChecked ? "bg-[#4A6741]" : "bg-stone-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                            isChecked ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 6 cols: Document Capabilities (Edit / Delete / Create / View) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A26]">
                    Document Privileges for {selectedRole}
                  </h3>
                  <p className="text-[11px] text-[#5C5852] mt-0.5">
                    Controls ability to create, edit, delete, and export records.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {DOCUMENT_SPECS.map((doc) => {
                  const docPerms = roleDocs[doc.key] || {};
                  return (
                    <div
                      key={doc.key}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-[#2D2A26]">
                        {doc.label}
                      </div>

                      {/* Capabilities Checkbox Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        {/* View */}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(docPerms.canView)}
                            onChange={() => handleToggleRoleDocAction(doc.key, "canView")}
                            className="rounded text-[#4A6741] focus:ring-[#4A6741]"
                          />
                          <span className="font-medium text-stone-700">View</span>
                        </label>

                        {/* Create */}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(docPerms.canCreate)}
                            onChange={() => handleToggleRoleDocAction(doc.key, "canCreate")}
                            className="rounded text-[#4A6741] focus:ring-[#4A6741]"
                          />
                          <span className="font-medium text-stone-700">Create</span>
                        </label>

                        {/* Edit */}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(docPerms.canEdit)}
                            onChange={() => handleToggleRoleDocAction(doc.key, "canEdit")}
                            className="rounded text-[#4A6741] focus:ring-[#4A6741]"
                          />
                          <span className="font-medium text-stone-700">Edit</span>
                        </label>

                        {/* Delete */}
                        {doc.allowDelete !== false ? (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(docPerms.canDelete)}
                              onChange={() => handleToggleRoleDocAction(doc.key, "canDelete")}
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span className="font-bold text-rose-700">Delete</span>
                          </label>
                        ) : (
                          <span className="text-stone-400 italic">No Delete</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-[#5C5852]">
              Configuring base privileges for role: <strong>{selectedRole}</strong>
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveRole}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : `Save Changes for ${selectedRole}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: INDIVIDUAL USER OVERRIDES ───────────────────────── */}
      {activeMainTab === "users" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">
                Custom User Overrides
              </h3>
              <p className="text-xs text-[#5C5852] mt-0.5">
                Users listed below have explicit custom overrides taking priority over their role defaults.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or employee ID..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#4A6741]/30 focus:border-[#4A6741]"
              />
            </div>
          </div>

          {/* Overrides Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-600 uppercase border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Override Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {(matrixData.userOverrides || [])
                  .filter((item) => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      item.user?.name?.toLowerCase().includes(q) ||
                      item.user?.employeeId?.toLowerCase().includes(q) ||
                      item.user?.email?.toLowerCase().includes(q)
                    );
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                        {item.user?.employeeId || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2D2A26]">{item.user?.name}</div>
                        <div className="text-[11px] text-stone-500">{item.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-stone-100 text-stone-700">
                          {item.user?.access}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/30">
                          Custom Overrides Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUserOverride(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition"
                        >
                          Edit Overrides
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetUserOverride(item.user._id, item.user.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          Reset to Role Default
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {(!matrixData.userOverrides || matrixData.userOverrides.length === 0) && (
              <div className="text-center py-12 text-stone-400 text-xs">
                No user-specific overrides configured yet. All users currently inherit standard role defaults.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User Override Edit Modal / Drawer ───────────────────────── */}
      {selectedUserForOverride && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F5F0E8]/70 border-b border-stone-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#2D2A26]">
                  Customize Permissions for {selectedUserForOverride.name}
                </h3>
                <p className="text-[11px] text-[#5C5852] mt-0.5">
                  Base Role: <strong>{selectedUserForOverride.access}</strong> • {selectedUserForOverride.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForOverride(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Document Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A6741]">
                  Document Editing & Deletion Privileges
                </h4>
                <div className="space-y-2">
                  {DOCUMENT_SPECS.map((doc) => {
                    const docPerms = userOverrideDocs[doc.key] || {};
                    return (
                      <div
                        key={doc.key}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="font-semibold text-stone-800">{doc.label}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(docPerms.canEdit)}
                              onChange={() => {
                                setUserOverrideDocs((prev) => ({
                                  ...prev,
                                  [doc.key]: {
                                    ...(prev[doc.key] || {}),
                                    canEdit: !prev[doc.key]?.canEdit,
                                  },
                                }));
                              }}
                              className="rounded text-[#4A6741]"
                            />
                            <span>Can Edit</span>
                          </label>

                          {doc.allowDelete !== false && (
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(docPerms.canDelete)}
                                onChange={() => {
                                  setUserOverrideDocs((prev) => ({
                                    ...prev,
                                    [doc.key]: {
                                      ...(prev[doc.key] || {}),
                                      canDelete: !prev[doc.key]?.canDelete,
                                    },
                                  }));
                                }}
                                className="rounded text-rose-600"
                              />
                              <span className="font-bold text-rose-700">Can Delete</span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabs Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A6741]">
                  Sidebar Tabs Visibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TAB_SPECS.map((tab) => {
                    const isAllowed = userOverrideTabs[tab.path] !== false;
                    return (
                      <label
                        key={tab.path}
                        className="p-2.5 rounded-xl border border-stone-200 flex items-center justify-between cursor-pointer hover:bg-stone-50"
                      >
                        <span className="font-medium text-stone-800">{tab.label}</span>
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => {
                            setUserOverrideTabs((prev) => ({
                              ...prev,
                              [tab.path]: prev[tab.path] === false ? true : false,
                            }));
                          }}
                          className="rounded text-[#4A6741]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUserForOverride(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveUserOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Custom Overrides"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
