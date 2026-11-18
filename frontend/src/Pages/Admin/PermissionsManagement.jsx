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
  GraduationCap,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  MinusSquare,
  HelpCircle,
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

// Document Definitions with Logical Groupings
const DOCUMENT_SPECS = [
  { key: "fortnightly", label: "Fortnightly Monitor", path: "/fortnightly-monitor", category: "Evaluation Forms", desc: "Teacher observation & monitoring" },
  { key: "walkthrough", label: "Classroom Walkthrough", path: "/classroom-walkthrough", category: "Evaluation Forms", desc: "Short classroom drop-in assessments" },
  { key: "notebook", label: "Notebook Checking Proforma", path: "/notebook-checking-proforma", category: "Evaluation Forms", desc: "Student notebook review & checks" },
  { key: "coScholastic", label: "Co-Scholastic Observation", path: "/co-scholastic", category: "Evaluation Forms", desc: "Holistic activities & rubrics" },
  { key: "weekly4", label: "Learning Progress Checklist (Weekly 4)", path: "/weekly4form", category: "Evaluation Forms", desc: "Learners-on-the-way progression" },
  { key: "wingCoordinator", label: "Wing Coordinator Form", path: "/wing-coordinator", category: "Wing & Reports", desc: "Monthly coordinator consolidation" },
  { key: "accountability", label: "Accountability Mechanism", path: "/accountability", category: "Wing & Reports", desc: "Institutional accountability proforma" },
  { key: "bestPractices", label: "Best Practices for Teachers", path: "/best-practices", category: "Resources", desc: "Pedagogical repository & creation" },
  { key: "users", label: "User Management", path: "/users", category: "Administration", desc: "Faculty & staff accounts management" },
  { key: "classSection", label: "Class & Section Setup", path: "/class-section", category: "Administration", desc: "Rosters, classes, & section mapping" },
  { key: "auditLogs", label: "Audit Logs", path: "/audit-logs", allowDelete: false, category: "Administration", desc: "Immutable security & action audit trail" },
];

// Navigation Tabs Definitions with Groupings
const TAB_SPECS = [
  { path: "/dashboard", label: "Dashboard", category: "Core Navigation" },
  { path: "/reports", label: "Overviews / Reports", category: "Core Navigation" },
  { path: "/profile", label: "User Profile", category: "Core Navigation" },
  { path: "/fortnightly-monitor", label: "Fortnightly Monitor", category: "Evaluation Forms" },
  { path: "/classroom-walkthrough", label: "Classroom Walkthrough", category: "Evaluation Forms" },
  { path: "/notebook-checking-proforma", label: "Notebook Checking", category: "Evaluation Forms" },
  { path: "/co-scholastic", label: "Co-Scholastic Observation", category: "Evaluation Forms" },
  { path: "/weekly4form", label: "Learning Progress Checklist", category: "Evaluation Forms" },
  { path: "/wing-coordinator", label: "Wing Coordinator", category: "Wing & Reports" },
  { path: "/accountability", label: "Accountability Mechanism", category: "Wing & Reports" },
  { path: "/best-practices", label: "Best Practices", category: "Resources" },
  { path: "/users", label: "User Management", category: "Administration" },
  { path: "/class-section", label: "Class / Section", category: "Administration" },
  { path: "/analytics-insights", label: "Admin Analytics", category: "Administration" },
  { path: "/audit-logs", label: "Audit Logs", category: "Administration" },
  { path: "/permissions", label: "Permissions & Access", category: "Administration" },
];

const ROLE_META = {
  Superadmin: {
    label: "Superadmin",
    badge: "Full System Authority",
    desc: "Unrestricted configuration, user administration, and system audit access",
    icon: ShieldCheck,
    color: "emerald",
  },
  Observer: {
    label: "Observer",
    badge: "Evaluators & Mentors",
    desc: "Initiates evaluations, conducts classroom walkthroughs, and submits wing reports",
    icon: UserCheck,
    color: "blue",
  },
  Teacher: {
    label: "Teacher",
    badge: "Faculty & Educators",
    desc: "Conducts self-reflections, views evaluation feedback, and accesses pedagogical best practices",
    icon: GraduationCap,
    color: "amber",
  },
};

// Custom Matrix Checkbox Component (Subtle, accessible, strictly no emojis)
const MatrixCheck = ({ checked, onChange, disabled, label, variant = "default" }) => {
  const variantStyles = {
    view: checked ? "bg-[#4A6741] text-white border-[#4A6741]" : "bg-white text-transparent border-stone-300 hover:border-[#4A6741]",
    create: checked ? "bg-teal-700 text-white border-teal-700" : "bg-white text-transparent border-stone-300 hover:border-teal-700",
    edit: checked ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-transparent border-stone-300 hover:border-indigo-700",
    delete: checked ? "bg-rose-600 text-white border-rose-600" : "bg-white text-transparent border-stone-300 hover:border-rose-600",
    default: checked ? "bg-[#4A6741] text-white border-[#4A6741]" : "bg-white text-transparent border-stone-300 hover:border-[#4A6741]",
  };

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 select-none cursor-not-allowed">
        <span className="w-4 h-4 rounded border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-300">
          —
        </span>
        <span className="hidden sm:inline">N/A</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-stone-100/80 transition cursor-pointer select-none group"
      title={`Toggle ${label}`}
    >
      <span
        className={`w-4 h-4 rounded-md border flex items-center justify-center transition shadow-2xs ${
          variantStyles[variant] || variantStyles.default
        }`}
      >
        <Check className={`w-3 h-3 stroke-[3] ${checked ? "opacity-100" : "opacity-0"}`} />
      </span>
      <span
        className={`text-xs font-semibold transition ${
          checked
            ? variant === "delete"
              ? "text-rose-700 font-bold"
              : "text-[#2D2A26]"
            : "text-stone-500 group-hover:text-stone-800"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default function PermissionsManagement() {
  const currentUser = getUserId();
  const isSuperadmin = currentUser?.access === "Superadmin";
  const { refreshPermissions } = usePermissions();

  const [isUnlocked, setIsUnlocked] = useState(() => isAdminFeaturesUnlocked());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Main Top-level Mode: "roles" | "users"
  const [activeMainTab, setActiveMainTab] = useState("roles");

  // Role Matrix configuration
  const [selectedRole, setSelectedRole] = useState("Observer");
  const [matrixData, setMatrixData] = useState({ roles: {}, userOverrides: [] });
  const [roleTabs, setRoleTabs] = useState({});
  const [roleDocs, setRoleDocs] = useState({});

  // Sub-view toggle inside Role Matrix: "matrix" | "tabs" | "split"
  const [matrixView, setMatrixView] = useState("split"); // "split" | "matrix" | "tabs"

  // Search filter
  const [searchFilter, setSearchFilter] = useState("");

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

  // Check if there are unsaved changes for the selected role
  const isDirty = useMemo(() => {
    const original = matrixData.roles?.[selectedRole] || {};
    const originalTabs = original.tabs || {};
    const originalDocs = original.documents || {};

    // Compare tabs
    for (const tab of TAB_SPECS) {
      if (Boolean(roleTabs[tab.path]) !== Boolean(originalTabs[tab.path])) return true;
    }

    // Compare docs
    for (const doc of DOCUMENT_SPECS) {
      const curr = roleDocs[doc.key] || {};
      const orig = originalDocs[doc.key] || {};
      if (Boolean(curr.canView) !== Boolean(orig.canView)) return true;
      if (Boolean(curr.canCreate) !== Boolean(orig.canCreate)) return true;
      if (Boolean(curr.canEdit) !== Boolean(orig.canEdit)) return true;
      if (Boolean(curr.canDelete) !== Boolean(orig.canDelete)) return true;
    }

    return false;
  }, [roleTabs, roleDocs, selectedRole, matrixData]);

  // Toggle single role tab
  const handleToggleRoleTab = (path) => {
    setRoleTabs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Toggle single document action
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

  // Batch: Toggle entire action column (e.g. all "canView" or all "canDelete")
  const handleBatchToggleColumn = (action) => {
    setRoleDocs((prev) => {
      const allActive = DOCUMENT_SPECS.every((doc) => {
        if (action === "canDelete" && doc.allowDelete === false) return true;
        return Boolean(prev[doc.key]?.[action]);
      });

      const nextState = !allActive;
      const updated = { ...prev };

      DOCUMENT_SPECS.forEach((doc) => {
        if (action === "canDelete" && doc.allowDelete === false) return;
        updated[doc.key] = {
          ...(updated[doc.key] || {}),
          [action]: nextState,
        };
      });

      return updated;
    });
  };

  // Batch Presets: Full Access / Read Only / Revoke All
  const handleApplyPreset = (preset) => {
    if (preset === "full") {
      setRoleDocs(
        DOCUMENT_SPECS.reduce((acc, doc) => ({
          ...acc,
          [doc.key]: {
            canView: true,
            canCreate: doc.key !== "auditLogs",
            canEdit: doc.key !== "auditLogs",
            canDelete: doc.allowDelete !== false,
            canExport: true,
          },
        }), {})
      );
      setRoleTabs(
        TAB_SPECS.reduce((acc, tab) => ({
          ...acc,
          [tab.path]: true,
        }), {})
      );
    } else if (preset === "readOnly") {
      setRoleDocs(
        DOCUMENT_SPECS.reduce((acc, doc) => ({
          ...acc,
          [doc.key]: {
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canExport: true,
          },
        }), {})
      );
    } else if (preset === "revoke") {
      setRoleDocs(
        DOCUMENT_SPECS.reduce((acc, doc) => ({
          ...acc,
          [doc.key]: {
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canExport: false,
          },
        }), {})
      );
    }
  };

  // Reset local changes back to matrixData
  const handleDiscardChanges = () => {
    const roleConfig = matrixData.roles?.[selectedRole] || {};
    setRoleTabs(roleConfig.tabs || {});
    setRoleDocs(roleConfig.documents || {});
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

  // User override helpers
  const handleOpenUserOverride = (userOverrideItem) => {
    const user = userOverrideItem.user;
    setSelectedUserForOverride(user);
    setUserOverrideTabs(userOverrideItem.tabs || {});
    setUserOverrideDocs(userOverrideItem.documents || {});
  };

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

  // Filtered lists based on searchFilter
  const filteredDocs = useMemo(() => {
    if (!searchFilter.trim()) return DOCUMENT_SPECS;
    const q = searchFilter.toLowerCase();
    return DOCUMENT_SPECS.filter(
      (d) => d.label.toLowerCase().includes(q) || d.path.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const filteredTabs = useMemo(() => {
    if (!searchFilter.trim()) return TAB_SPECS;
    const q = searchFilter.toLowerCase();
    return TAB_SPECS.filter(
      (t) => t.label.toLowerCase().includes(q) || t.path.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  // Group tabs by category
  const tabCategories = useMemo(() => {
    const groups = {};
    filteredTabs.forEach((tab) => {
      if (!groups[tab.category]) groups[tab.category] = [];
      groups[tab.category].push(tab);
    });
    return groups;
  }, [filteredTabs]);

  // Group docs by category
  const docCategories = useMemo(() => {
    const groups = {};
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    });
    return groups;
  }, [filteredDocs]);

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

  // ── PIN Locked View ──────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-[#4A6741]/10 text-[#4A6741] mx-auto flex items-center justify-center shadow-xs">
          <Lock className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#2D2A26] tracking-tight">
            Administrator Verification Required
          </h2>
          <p className="text-sm text-[#5C5852] mt-2 max-w-md mx-auto leading-relaxed">
            The Permissions & Access Control panel configures user privileges, navigation tab availability, and document CRUD rights. Please enter the administrator PIN to unlock.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsPinModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#4A6741] text-white hover:bg-[#3d5635] transition shadow-xs cursor-pointer"
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

  // ── Unlocked Permissions Workspace ───────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-7 text-[#2D2A26] space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A6741]/12 text-[#4A6741] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D2A26] tracking-tight">
              Role & User Permissions Management
            </h1>
            <p className="text-xs text-[#5C5852] mt-0.5">
              Configure role-level CRUD capabilities, sidebar navigation visibility, and user-specific overrides.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {isDirty && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveRole}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#3d5635] shadow-xs transition cursor-pointer select-none"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setAdminFeaturesUnlocked(false);
              setIsUnlocked(false);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200/90 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
            title="Lock session"
          >
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {saveMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition animate-in fade-in shadow-2xs ${
            saveMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveMessage(null)}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Mode Tabs: Roles vs Users */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveMainTab("roles")}
          className={`pb-3 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer select-none ${
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
          className={`pb-3 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer select-none ${
            activeMainTab === "users"
              ? "border-[#4A6741] text-[#4A6741]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Individual User Overrides</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
            {matrixData.userOverrides?.length || 0}
          </span>
        </button>
      </div>

      {/* ── TAB 1: ROLE MATRIX ─────────────────────────────────────── */}
      {activeMainTab === "roles" && (
        <div className="space-y-6">
          {/* ── Role Selector Pill Bar (Clean, Visual, High Contrast) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Observer", "Teacher", "Superadmin"].map((roleKey) => {
              const meta = ROLE_META[roleKey];
              const Icon = meta.icon;
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setSelectedRole(roleKey)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer select-none flex items-start gap-3.5 relative ${
                    isSelected
                      ? "bg-white border-[#4A6741] shadow-xs ring-1 ring-[#4A6741]/20"
                      : "bg-white/80 border-stone-200/90 hover:bg-white hover:border-stone-300"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#4A6741] text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2D2A26]">{meta.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-[#4A6741]/10 text-[#4A6741]"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C5852] mt-1 leading-snug line-clamp-2">
                      {meta.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Toolbar: Sub-views, Search, & Fast Presets ─── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs">
            {/* Left: View Mode Segmented Switch */}
            <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl">
              <button
                type="button"
                onClick={() => setMatrixView("split")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  matrixView === "split"
                    ? "bg-white text-[#4A6741] shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Split Overview
              </button>
              <button
                type="button"
                onClick={() => setMatrixView("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  matrixView === "matrix"
                    ? "bg-white text-[#4A6741] shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Document Privileges ({filteredDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setMatrixView("tabs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  matrixView === "tabs"
                    ? "bg-white text-[#4A6741] shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Sidebar Tabs ({filteredTabs.length})
              </button>
            </div>

            {/* Right: Quick Search & Role Presets */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter documents or routes..."
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2A26] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#4A6741] focus:bg-white transition"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Fast Presets Dropdown / Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset("readOnly")}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer select-none"
                  title="Grant View to all documents"
                >
                  Read-Only Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("full")}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#4A6741]/10 hover:bg-[#4A6741]/20 text-[#4A6741] transition cursor-pointer select-none"
                  title="Grant all CRUD privileges"
                >
                  Full Access
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Permissions Workspace ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── COLUMN A: Document Privileges CRUD Matrix (7 cols in split, 12 in matrix) ─── */}
            {(matrixView === "split" || matrixView === "matrix") && (
              <div
                className={`${
                  matrixView === "split" ? "lg:col-span-7" : "lg:col-span-12"
                } bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden space-y-0`}
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAFBF9]">
                  <div>
                    <h2 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#4A6741]" />
                      Document CRUD Privileges for {selectedRole}
                    </h2>
                    <p className="text-[11px] text-[#5C5852] mt-0.5">
                      Click column headers to batch-toggle privileges across all documents.
                    </p>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-100/70 border-b border-stone-200 text-[11px] font-bold text-stone-600">
                        <th className="py-2.5 px-4 w-[40%]">Document / Module</th>
                        <th className="py-2.5 px-2 text-center w-[15%]">
                          <button
                            type="button"
                            onClick={() => handleBatchToggleColumn("canView")}
                            className="inline-flex items-center gap-1 hover:text-[#4A6741] cursor-pointer"
                            title="Toggle all View"
                          >
                            <span>View</span>
                          </button>
                        </th>
                        <th className="py-2.5 px-2 text-center w-[15%]">
                          <button
                            type="button"
                            onClick={() => handleBatchToggleColumn("canCreate")}
                            className="inline-flex items-center gap-1 hover:text-teal-700 cursor-pointer"
                            title="Toggle all Create"
                          >
                            <span>Create</span>
                          </button>
                        </th>
                        <th className="py-2.5 px-2 text-center w-[15%]">
                          <button
                            type="button"
                            onClick={() => handleBatchToggleColumn("canEdit")}
                            className="inline-flex items-center gap-1 hover:text-indigo-700 cursor-pointer"
                            title="Toggle all Edit"
                          >
                            <span>Edit</span>
                          </button>
                        </th>
                        <th className="py-2.5 px-2 text-center w-[15%]">
                          <button
                            type="button"
                            onClick={() => handleBatchToggleColumn("canDelete")}
                            className="inline-flex items-center gap-1 hover:text-rose-700 cursor-pointer"
                            title="Toggle all Delete"
                          >
                            <span>Delete</span>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {Object.entries(docCategories).map(([catName, docsInCat]) => (
                        <React.Fragment key={catName}>
                          <tr className="bg-stone-50/70">
                            <td
                              colSpan={5}
                              className="py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-[#4A6741]"
                            >
                              {catName}
                            </td>
                          </tr>
                          {docsInCat.map((doc) => {
                            const docPerms = roleDocs[doc.key] || {};
                            return (
                              <tr
                                key={doc.key}
                                className="hover:bg-[#F5F0E8]/30 transition group"
                              >
                                <td className="py-2.5 px-4">
                                  <div className="font-bold text-[#2D2A26]">{doc.label}</div>
                                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                                    {doc.path}
                                  </div>
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <MatrixCheck
                                    checked={Boolean(docPerms.canView)}
                                    onChange={() => handleToggleRoleDocAction(doc.key, "canView")}
                                    label="View"
                                    variant="view"
                                  />
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <MatrixCheck
                                    checked={Boolean(docPerms.canCreate)}
                                    onChange={() => handleToggleRoleDocAction(doc.key, "canCreate")}
                                    label="Create"
                                    variant="create"
                                  />
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <MatrixCheck
                                    checked={Boolean(docPerms.canEdit)}
                                    onChange={() => handleToggleRoleDocAction(doc.key, "canEdit")}
                                    label="Edit"
                                    variant="edit"
                                  />
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <MatrixCheck
                                    checked={Boolean(docPerms.canDelete)}
                                    onChange={() => handleToggleRoleDocAction(doc.key, "canDelete")}
                                    disabled={doc.allowDelete === false}
                                    label="Delete"
                                    variant="delete"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── COLUMN B: Sidebar Navigation Visibility (5 cols in split, 12 in tabs) ─── */}
            {(matrixView === "split" || matrixView === "tabs") && (
              <div
                className={`${
                  matrixView === "split" ? "lg:col-span-5" : "lg:col-span-12"
                } bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden space-y-0`}
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAFBF9]">
                  <div>
                    <h2 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#4A6741]" />
                      Sidebar Tabs Visibility for {selectedRole}
                    </h2>
                    <p className="text-[11px] text-[#5C5852] mt-0.5">
                      Toggle navigation sections visible in the sidebar menu.
                    </p>
                  </div>
                </div>

                {/* Grouped Tab Switches */}
                <div className="p-4 space-y-4">
                  {Object.entries(tabCategories).map(([catName, tabsInCat]) => (
                    <div key={catName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#5C5852] pb-1 border-b border-stone-100">
                        <span>{catName}</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          {tabsInCat.filter((t) => roleTabs[t.path] !== false).length}/{tabsInCat.length} visible
                        </span>
                      </div>

                      <div className="space-y-1">
                        {tabsInCat.map((tab) => {
                          const isChecked = roleTabs[tab.path] !== false;
                          return (
                            <div
                              key={tab.path}
                              onClick={() => handleToggleRoleTab(tab.path)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                                isChecked
                                  ? "bg-white border-stone-200/90 hover:border-[#4A6741]"
                                  : "bg-stone-50 border-stone-200/60 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-semibold text-[#2D2A26] truncate">
                                  {tab.label}
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono">
                                  {tab.path}
                                </div>
                              </div>

                              {/* iOS Styled Switch */}
                              <div
                                className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                                  isChecked ? "bg-[#4A6741]" : "bg-stone-300"
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs ${
                                    isChecked ? "translate-x-3.5" : "translate-x-0"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Floating Sticky Action Bar (appears when changes are unsaved) ─── */}
          {isDirty && (
            <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-[#2D2A26] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold">
                  You have unsaved permission modifications for <strong>{selectedRole}</strong>.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveRole}
                  className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#3d5635] transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : `Save Changes for ${selectedRole}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: INDIVIDUAL USER OVERRIDES ───────────────────────── */}
      {activeMainTab === "users" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4A6741]" />
                User-Specific Custom Overrides
              </h2>
              <p className="text-xs text-[#5C5852] mt-0.5">
                Users configured here hold explicit overrides that take priority over their baseline role permissions.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or employee ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
              />
            </div>
          </div>

          {/* Overrides Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-600 uppercase border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">Employee ID</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Base Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
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
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">
                        {item.user?.employeeId || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#2D2A26]">{item.user?.name}</div>
                        <div className="text-[11px] text-stone-500">{item.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-stone-100 text-stone-700">
                          {item.user?.access}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/30">
                          Custom Overrides Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUserOverride(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition cursor-pointer"
                        >
                          Edit Overrides
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetUserOverride(item.user._id, item.user.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
                No user-specific overrides configured yet. All educators and observers currently inherit their standard role defaults.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User Override Edit Modal ─────────────────────────────── */}
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
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition cursor-pointer"
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
                          <MatrixCheck
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
                            label="Can Edit"
                            variant="edit"
                          />

                          {doc.allowDelete !== false && (
                            <MatrixCheck
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
                              label="Can Delete"
                              variant="delete"
                            />
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
                      <div
                        key={tab.path}
                        onClick={() => {
                          setUserOverrideTabs((prev) => ({
                            ...prev,
                            [tab.path]: prev[tab.path] === false ? true : false,
                          }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                          isAllowed
                            ? "bg-white border-stone-200 hover:border-[#4A6741]"
                            : "bg-stone-50 border-stone-200/60 opacity-60"
                        }`}
                      >
                        <span className="font-medium text-stone-800">{tab.label}</span>
                        <div
                          className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            isAllowed ? "bg-[#4A6741]" : "bg-stone-300"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform shadow-xs ${
                              isAllowed ? "translate-x-3" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveUserOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#3d5635] transition shadow-xs cursor-pointer disabled:opacity-60"
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
