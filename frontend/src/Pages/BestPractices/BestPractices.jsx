import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Bookmark,
  Clock,
  Compass,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  Target,
  Lightbulb,
  Award,
  Share2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Filter,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  RotateCcw,
  BookOpen,
  Info,
  Plus,
} from "lucide-react";
import {
  THEME_CONFIG,
  FILTER_OPTIONS,
} from "./bestPracticesData";
import { getUserId } from "../../Utils/auth";
import {
  fetchAllBestPractices,
  createBestPracticeApi,
} from "../../redux/bestPracticesApi";
import AddBestPracticeModal from "./AddBestPracticeModal";
import BestPracticeDetail from "./BestPracticeDetail";

// Helper to get initials from teacher name (strips prefixes like Dr., Ms., Mr.)
const getTeacherInitials = (name = "") => {
  const clean = name.replace(/^(Ms\.|Mr\.|Dr\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper for theme styling
const getThemeStyle = (themeName) => {
  const conf = THEME_CONFIG[themeName];
  if (conf) {
    return {
      color: conf.color,
      backgroundColor: conf.bg,
      borderColor: conf.border,
    };
  }
  return {
    color: "#4A6741",
    backgroundColor: "rgba(74, 103, 65, 0.10)",
    borderColor: "rgba(74, 103, 65, 0.25)",
  };
};

const STEP_LABELS = [
  "Set the Stage",
  "Get Started",
  "Core Activity",
  "Wrap Up & Reflect",
  "Extension & Follow-up",
];

// Accessible custom-styled checkbox row aligned with DLF Brand Theme (#4A6741)
const FilterOptionRow = ({ label, count, isChecked, onToggle }) => (
  <div
    role="checkbox"
    aria-checked={isChecked}
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onToggle();
      }
    }}
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      width: "100%",
      boxSizing: "border-box",
      cursor: "pointer",
      userSelect: "none",
    }}
    className={`group transition-all rounded-xl text-xs px-3 py-2.5 outline-none ${
      isChecked
        ? "bg-[#4A6741]/10 border-2 border-[#4A6741] text-[#1F2E1B] font-semibold shadow-2xs"
        : "bg-white border border-stone-200 text-[#2D2A26] hover:border-[#4A6741]/50 hover:bg-[#F5F0E8]/50"
    }`}
  >
    {/* Left: custom visual checkbox + label text */}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
        flexShrink: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "16px",
          height: "16px",
        }}
        className={`rounded-md transition-all ${
          isChecked
            ? "bg-[#4A6741] border border-[#4A6741]"
            : "border border-stone-400 bg-white group-hover:border-[#4A6741]"
        }`}
      >
        {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </div>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
        className="text-xs font-medium"
        title={label}
      >
        {label}
      </span>
    </div>

    {/* Right: count badge — guaranteed inline on the same horizontal row */}
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginLeft: "8px",
        lineHeight: 1,
      }}
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
        isChecked
          ? "bg-[#4A6741] text-white"
          : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
      }`}
    >
      {count}
    </span>
  </div>
);

export default function BestPractices() {
  const userData = getUserId();
  const isAdmin = userData?.access === "Superadmin";

  // All data comes from the database — no static fallback
  const [practicesList, setPracticesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    fetchAllBestPractices()
      .then((list) => {
        setPracticesList(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("[BestPractices] Failed to load from API:", err.message);
        setLoadError("Could not load practices. Please check your connection and try again.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    grade: [],
    pedagogy: [],
    theme: [],
    atype: [],
    nep: [],
  });
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);

  // Navigation & URL Routing
  const params = useParams();
  const routeId = params?.id;
  const navigate = useNavigate();

  // Selected practice state (supports direct clicks or deep-linking via :id)
  const [selectedPractice, setSelectedPractice] = useState(null);

  // Active practice for full-page view
  const activePractice = useMemo(() => {
    if (selectedPractice) return selectedPractice;
    if (!routeId || !Array.isArray(practicesList) || practicesList.length === 0) return null;
    return (
      practicesList.find(
        (p) => p && (String(p.id) === String(routeId) || String(p._id) === String(routeId))
      ) || null
    );
  }, [selectedPractice, routeId, practicesList]);

  // Persistence: Bookmarks & Explored IDs
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("dlf_teacher_bp_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [explored, setExplored] = useState(() => {
    try {
      const saved = localStorage.getItem("dlf_teacher_bp_explored");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep explored list in sync whenever activePractice is viewed
  useEffect(() => {
    if (activePractice?.id) {
      setExplored((prev) => {
        if (prev.includes(activePractice.id)) return prev;
        const next = [...prev, activePractice.id];
        try {
          localStorage.setItem("dlf_teacher_bp_explored", JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [activePractice]);

  // Save bookmarks
  const toggleBookmark = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem("dlf_teacher_bp_bookmarks", JSON.stringify(next));
      } catch {
        // storage quota fallback
      }
      return next;
    });
  }, []);

  // Open practice navigation (navigates to /best-practices/:id for full page view)
  const handleOpenPractice = useCallback((practice) => {
    setSelectedPractice(practice);
    setExplored((prev) => {
      if (prev.includes(practice.id)) return prev;
      const next = [...prev, practice.id];
      try {
        localStorage.setItem("dlf_teacher_bp_explored", JSON.stringify(next));
      } catch {}
      return next;
    });

    if (navigate) {
      navigate(`/best-practices/${practice.id}`);
    }
  }, [navigate]);

  // Close / Back navigation back to repository list
  const handleClosePractice = useCallback(() => {
    setSelectedPractice(null);
    if (navigate) {
      navigate("/best-practices");
    }
  }, [navigate]);

  // Sync hash on initial load (backward compatibility with #practice-4)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#practice-(\d+)$/);
      if (match && Array.isArray(practicesList) && practicesList.length > 0) {
        const id = parseInt(match[1], 10);
        const p = practicesList.find((item) => item.id === id);
        if (p) {
          handleOpenPractice(p);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [handleOpenPractice, practicesList]);

  // Keyboard accessibility: ESC returns to list when viewing full-page detail
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activePractice) {
          handleClosePractice();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePractice, handleClosePractice]);

  // Lock background scroll ONLY when admin add modal dialog is open
  useEffect(() => {
    if (isAddModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAddModalOpen]);

  // Major grades for top quick-filter tabs
  const MAJOR_GRADES = useMemo(
    () => [
      "All Grades",
      "Pre-primary",
      "Primary (I–V)",
      "Middle (VI–VIII)",
      "Secondary (IX–X)",
      "Sr. Secondary (XI–XII)",
      "Whole School",
    ],
    []
  );

  const handleSelectGradeTab = (gradeOpt) => {
    if (gradeOpt === "All Grades") {
      setActiveFilters((prev) => ({ ...prev, grade: [] }));
    } else {
      setActiveFilters((prev) => {
        const exists = prev.grade.includes(gradeOpt);
        return {
          ...prev,
          grade: exists
            ? prev.grade.filter((g) => g !== gradeOpt)
            : [...prev.grade, gradeOpt],
        };
      });
    }
  };

  // Toggle filter item
  const handleToggleFilter = (category, value) => {
    setActiveFilters((prev) => {
      const list = prev[category] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [category]: exists
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setActiveFilters({
      grade: [],
      pedagogy: [],
      theme: [],
      atype: [],
      nep: [],
    });
    setSearchQuery("");
    setOnlyBookmarks(false);
  };

  // Check how many active filters
  const totalActiveFilterCount = useMemo(() => {
    const fromCats = Object.values(activeFilters).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
    return fromCats + (onlyBookmarks ? 1 : 0) + (searchQuery.trim() ? 1 : 0);
  }, [activeFilters, onlyBookmarks, searchQuery]);

  // Filter logic
  const filteredPractices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return practicesList.filter((p) => {
      // Bookmark filter
      if (onlyBookmarks && !bookmarks.includes(p.id)) {
        return false;
      }

      // Filter groups
      for (const [key, selectedVals] of Object.entries(activeFilters)) {
        if (selectedVals.length > 0) {
          const practiceVals = p[key] || [];
          const matchesAny = selectedVals.some((val) =>
            practiceVals.includes(val)
          );
          if (!matchesAny) return false;
        }
      }

      // Search query across all core fields
      if (query) {
        const searchable = [
          p.title,
          p.teacher,
          p.brief,
          p.lo,
          p.tlp,
          p.resources,
          p.atool_text,
          p.evid_text,
          p.remedial_text,
          p.refs,
          p.ksf,
          ...(p.grade || []),
          ...(p.theme || []),
          ...(p.pedagogy || []),
          ...(p.nep || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [searchQuery, activeFilters, onlyBookmarks, bookmarks, practicesList]);

  // Counts for each filter option
  const filterCounts = useMemo(() => {
    const counts = {};
    for (const [cat, options] of Object.entries(FILTER_OPTIONS)) {
      counts[cat] = {};
      for (const opt of options) {
        counts[cat][opt] = practicesList.filter((p) =>
          (p[cat] || []).includes(opt)
        ).length;
      }
    }
    return counts;
  }, [practicesList]);

  // Progress metrics
  const exploredCount = useMemo(() => {
    return explored.filter((id) => practicesList.some((p) => p.id === id)).length;
  }, [explored, practicesList]);

  const progressPercent = Math.round(
    practicesList.length > 0 ? (exploredCount / practicesList.length) * 100 : 0
  );

  // Related practices for active practice view
  const relatedPractices = useMemo(() => {
    if (!activePractice) return [];
    const pThemes = activePractice.theme || [];
    const pGrades = activePractice.grade || [];

    return practicesList.filter(
      (p) =>
        p.id !== activePractice.id &&
        ((p.theme || []).some((t) => pThemes.includes(t)) ||
          (p.grade || []).some((g) => pGrades.includes(g)))
    ).slice(0, 4);
  }, [activePractice, practicesList]);

  const handleAddPractice = async (formData) => {
    try {
      const apiResult = await createBestPracticeApi(formData);
      if (!apiResult || !apiResult.id) {
        throw new Error("Failed to save best practice to the database.");
      }

      setPracticesList((prev) => [
        apiResult,
        ...(Array.isArray(prev)
          ? prev.filter((p) => p && p.id !== apiResult.id)
          : []),
      ]);
      handleOpenPractice(apiResult);
    } catch (err) {
      console.error("Failed to add best practice:", err);
      alert("Failed to save best practice to the database. Please check your connection and try again.");
    }
  };

  // ── FULL PAGE DETAIL VIEW (No popup modal / no constrained scrolling) ─────
  if (activePractice) {
    return (
      <BestPracticeDetail
        practice={activePractice}
        onBack={handleClosePractice}
        onSelectPractice={handleOpenPractice}
        isBookmarked={bookmarks.includes(activePractice.id)}
        onToggleBookmark={toggleBookmark}
        relatedPractices={relatedPractices}
      />
    );
  }

  // Deep-link loading skeleton
  if (routeId && isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded-xl" />
        <div className="h-44 bg-stone-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-stone-200 rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 text-[#2D2A26] space-y-6">
      {/* ── Top Header Section (Naturally Blends with Background) ─ */}
      <div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#2D2A26] tracking-tight">
              Best Practices for Teachers
            </h1>
            <p className="mt-2 text-sm md:text-base text-[#5C5852] leading-relaxed">
              Curated pedagogical practices, classroom strategies, and NEP 2020 aligned learning activities developed and practiced by DLF Public School educators.
            </p>
          </div>

          {/* Progress Tracker Card - soft translucent parchment surface */}
          <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-4 md:p-5 border border-stone-200/80 flex flex-col justify-center min-w-[240px] shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4A6741] mb-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Explored Repository
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A6741] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[#5C5852] text-right font-medium">
              {exploredCount} of {practicesList.length} practices reviewed
            </div>
          </div>
        </div>

        {/* ── Search & Actions Bar (Blends Seamlessly with BG) ─── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practices, teachers, pedagogy, topics, keywords..."
              className="w-full pl-11 pr-11 py-3 bg-white/90 border border-stone-200/90 rounded-2xl text-sm text-[#2D2A26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/30 focus:border-[#4A6741] focus:bg-white shadow-2xs transition"
            />
            {searchQuery && (
              <div className="absolute right-3.5 inset-y-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bookmarks Filter Button */}
          <button
            type="button"
            onClick={() => setOnlyBookmarks((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition border cursor-pointer select-none shadow-2xs ${
              onlyBookmarks
                ? "bg-[#4A6741] text-white border-[#4A6741] shadow-xs"
                : "bg-white/90 text-[#2D2A26] border-stone-200/90 hover:bg-white hover:border-stone-300"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${onlyBookmarks ? "fill-current" : ""}`} />
            <span>Saved Practices</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                onlyBookmarks
                  ? "bg-white/20 text-white"
                  : "bg-stone-100 text-[#5C5852]"
              }`}
            >
              {bookmarks.length}
            </span>
          </button>

          {/* Admin Add Best Practice Action */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs shrink-0 cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>Add Best Practice</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Top Major Filters & Accordion Toggle Bar ─────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Major Filter: Quick Grade Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] shrink-0 mr-1 hidden sm:inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4A6741]" />
            <span>Grades:</span>
          </span>

          {MAJOR_GRADES.map((gradeOpt) => {
            const isAll = gradeOpt === "All Grades";
            const isSelected = isAll
              ? activeFilters.grade.length === 0
              : activeFilters.grade.includes(gradeOpt);
            const count = isAll
              ? practicesList.length
              : filterCounts.grade[gradeOpt] || 0;

            return (
              <button
                key={gradeOpt}
                type="button"
                onClick={() => handleSelectGradeTab(gradeOpt)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer select-none border shadow-2xs ${
                  isSelected
                    ? "bg-[#4A6741] text-white border-[#4A6741] shadow-xs"
                    : "bg-white/80 text-[#334155] border-stone-200/80 hover:bg-white hover:border-stone-300"
                }`}
              >
                <span>{gradeOpt}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accordion Expand Button & Quick Reset */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
          {totalActiveFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A6741] hover:text-[#2D3E27] hover:bg-[#4A6741]/10 rounded-xl transition cursor-pointer"
              title="Reset all applied filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFilterAccordionOpen((prev) => !prev)}
            aria-expanded={isFilterAccordionOpen}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border cursor-pointer select-none shadow-2xs ${
              isFilterAccordionOpen || totalActiveFilterCount > 0
                ? "bg-[#4A6741] text-white border-[#4A6741] shadow-xs"
                : "bg-white/80 text-[#2D2A26] border-stone-200/80 hover:bg-white hover:border-stone-300"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Filters</span>
            {totalActiveFilterCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[11px] rounded-full font-bold ${
                  isFilterAccordionOpen || totalActiveFilterCount > 0
                    ? "bg-white/25 text-white"
                    : "bg-[#4A6741] text-white"
                }`}
              >
                {totalActiveFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                isFilterAccordionOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Full-Breadth Filter Accordion (Naturally Blended Panel) ─ */}
      {isFilterAccordionOpen && (
        <div className="w-full bg-[#FAF7F2]/90 backdrop-blur-md rounded-2xl border border-[#E5DECE] shadow-sm p-6 sm:p-8 my-5 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-stone-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Filter className="w-4 h-4 text-[#4A6741]" />
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">
                  Filter by Pedagogical Dimensions
                </h3>
                {totalActiveFilterCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs rounded-full font-bold bg-[#4A6741]/10 text-[#4A6741]">
                    {totalActiveFilterCount} active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Select multiple attributes across grade levels, pedagogies, themes, and NEP 2020 parameters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {totalActiveFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A6741] hover:bg-[#4A6741]/10 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFilterAccordionOpen(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-stone-200/60 rounded-lg transition"
              >
                <span>Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4-Column Full-Breadth Grid with Generous Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Grade Level */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3.5 pb-1.5 border-b border-stone-200/80 flex items-center justify-between">
                <span>Grade Level</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {FILTER_OPTIONS.grade.length} options
                </span>
              </h4>
              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto p-2 scrollbar-thin">
                {FILTER_OPTIONS.grade.map((opt) => (
                  <FilterOptionRow
                    key={opt}
                    label={opt}
                    count={filterCounts.grade[opt] || 0}
                    isChecked={activeFilters.grade.includes(opt)}
                    onToggle={() => handleToggleFilter("grade", opt)}
                  />
                ))}
              </div>
            </div>

            {/* Column 2: Pedagogical Approach */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3.5 pb-1.5 border-b border-stone-200/80 flex items-center justify-between">
                <span>Pedagogy</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {FILTER_OPTIONS.pedagogy.length} options
                </span>
              </h4>
              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto p-2 scrollbar-thin">
                {FILTER_OPTIONS.pedagogy.map((opt) => (
                  <FilterOptionRow
                    key={opt}
                    label={opt}
                    count={filterCounts.pedagogy[opt] || 0}
                    isChecked={activeFilters.pedagogy.includes(opt)}
                    onToggle={() => handleToggleFilter("pedagogy", opt)}
                  />
                ))}
              </div>
            </div>

            {/* Column 3: Focus Theme */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3.5 pb-1.5 border-b border-stone-200/80 flex items-center justify-between">
                <span>Core Theme</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {FILTER_OPTIONS.theme.length} options
                </span>
              </h4>
              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto p-2 scrollbar-thin">
                {FILTER_OPTIONS.theme.map((opt) => (
                  <FilterOptionRow
                    key={opt}
                    label={opt}
                    count={filterCounts.theme[opt] || 0}
                    isChecked={activeFilters.theme.includes(opt)}
                    onToggle={() => handleToggleFilter("theme", opt)}
                  />
                ))}
              </div>
            </div>

            {/* Column 4: Assessment & NEP 2020 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3.5 pb-1.5 border-b border-stone-200/80 flex items-center justify-between">
                <span>NEP & Assessment</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {FILTER_OPTIONS.nep.length + FILTER_OPTIONS.atype.length} options
                </span>
              </h4>
              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto p-2 scrollbar-thin">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-1 pb-0.5">
                  NEP 2020 Pillars
                </div>
                {FILTER_OPTIONS.nep.map((opt) => (
                  <FilterOptionRow
                    key={opt}
                    label={opt}
                    count={filterCounts.nep[opt] || 0}
                    isChecked={activeFilters.nep.includes(opt)}
                    onToggle={() => handleToggleFilter("nep", opt)}
                  />
                ))}

                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-3 pb-0.5">
                  Assessment Types
                </div>
                {FILTER_OPTIONS.atype.map((opt) => (
                  <FilterOptionRow
                    key={opt}
                    label={opt}
                    count={filterCounts.atype[opt] || 0}
                    isChecked={activeFilters.atype.includes(opt)}
                    onToggle={() => handleToggleFilter("atype", opt)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accordion Footer Action */}
          <div className="mt-6 pt-5 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#64748B]">
              {filteredPractices.length === practicesList.length ? (
                <span>Showing all {practicesList.length} practices</span>
              ) : (
                <span>
                  Filters match <strong className="text-[#1E293B]">{filteredPractices.length}</strong> of {practicesList.length} practices
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsFilterAccordionOpen(false)}
              className="px-5 py-2.5 bg-[#4A6741] text-white rounded-xl text-xs font-semibold hover:bg-[#2D3E27] transition shadow-xs self-end sm:self-auto cursor-pointer"
            >
              Done Filtering
            </button>
          </div>
        </div>
      )}

      {/* ── Active Filter Tags & Results Counter Bar ──────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
        <div data-testid="results-count" className="text-sm font-semibold text-[#5C5852]">
          Showing{" "}
          <span className="text-[#2D2A26] font-bold">
            {filteredPractices.length}
          </span>{" "}
          of {practicesList.length} practices
        </div>

        {/* Active Filter Chips */}
        {totalActiveFilterCount > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {onlyBookmarks && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/25 shadow-2xs">
                <span>Saved Only</span>
                <button
                  type="button"
                  onClick={() => setOnlyBookmarks(false)}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {Object.entries(activeFilters).map(([cat, list]) =>
              list.map((item) => (
                <span
                  key={`${cat}-${item}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-[#2D2A26] border border-stone-200/90 shadow-2xs"
                >
                  <span className="truncate max-w-[160px]">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFilter(cat, item)}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </span>
              ))
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-[#4A6741] hover:text-[#2D3E27] hover:underline px-2 py-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Full-Width Cards Grid (No Cramped Second Sidebar) ──── */}
      {isLoading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-7 shadow-2xs animate-pulse">
              <div className="h-1.5 w-full bg-stone-200 rounded-full mb-5" />
              <div className="h-4 bg-stone-200 rounded-lg w-2/3 mb-3" />
              <div className="h-3 bg-stone-100 rounded-lg w-full mb-2" />
              <div className="h-3 bg-stone-100 rounded-lg w-4/5 mb-5" />
              <div className="flex gap-2 mt-4">
                <div className="h-5 bg-stone-100 rounded-full w-20" />
                <div className="h-5 bg-stone-100 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        /* Error state */
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-red-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2D2A26]">Could not load practices</h3>
          <p className="mt-1 text-sm text-[#5C5852] max-w-sm mx-auto">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setLoadError(null);
              fetchAllBestPractices()
                .then((list) => setPracticesList(Array.isArray(list) ? list : []))
                .catch((err) => setLoadError(err.message))
                .finally(() => setIsLoading(false));
            }}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#4A6741] text-white rounded-xl text-sm font-semibold hover:bg-[#2D3E27] transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredPractices.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-stone-200/90 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#F5F0E8] text-[#4A6741] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2D2A26]">
            No practices matched your criteria
          </h3>
          <p className="mt-1 text-sm text-[#5C5852] max-w-sm mx-auto">
            Try loosening your filters or search keywords to explore more practices from our repository.
          </p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#4A6741] text-white rounded-xl text-sm font-semibold hover:bg-[#2D3E27] transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {filteredPractices.map((practice) => {
            const isBookmarked = bookmarks.includes(practice.id);
            const hasExplored = explored.includes(practice.id);
            const initials = getTeacherInitials(practice.teacher);
            const primaryTheme = practice.theme?.[0] || "Pedagogy";
            const themeBadgeStyle = getThemeStyle(primaryTheme);

            return (
              <div
                key={practice.id}
                onClick={() => handleOpenPractice(practice)}
                className="group bg-white rounded-2xl border border-stone-200/80 hover:border-[#4A6741]/50 p-6 md:p-7 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Subtle Theme Line at Top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: themeBadgeStyle.color }}
                />

                <div>
                  {/* Top Meta Bar: Theme Pill & Bookmark */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      style={themeBadgeStyle}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border truncate max-w-[220px]"
                    >
                      {primaryTheme}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasExplored && (
                        <span className="text-[11px] font-semibold text-[#4A6741] bg-[#4A6741]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Reviewed
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(practice.id, e)}
                        title={isBookmarked ? "Remove Bookmark" : "Save Practice"}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? "text-[#4A6741] bg-[#4A6741]/10"
                            : "text-gray-300 hover:text-[#4A6741] hover:bg-gray-100"
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Practice Title */}
                  <h2 className="text-base md:text-lg font-bold text-[#1E293B] group-hover:text-[#4A6741] transition-colors leading-snug mb-2.5">
                    {practice.title}
                  </h2>

                  {/* Teacher & Duration Row */}
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-full bg-[#4A6741]/15 text-[#4A6741] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <span className="truncate font-semibold text-[#334155]">
                        {practice.teacher}
                      </span>
                    </div>

                    {practice.duration && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] shrink-0 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">{practice.duration}</span>
                      </span>
                    )}
                  </div>

                  {/* Grades & NEP Alignment Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {(practice.grade || []).slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                      >
                        {g}
                      </span>
                    ))}
                    {(practice.grade || []).length > 3 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">
                        +{practice.grade.length - 3}
                      </span>
                    )}

                    {(practice.pedagogy || []).slice(0, 1).map((ped) => (
                      <span
                        key={ped}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60 truncate max-w-[160px]"
                      >
                        {ped}
                      </span>
                    ))}
                  </div>

                  {/* Excerpt Synopsis */}
                  <p className="text-xs md:text-sm text-[#475569] line-clamp-3 leading-relaxed mb-4">
                    {practice.brief || "No description available."}
                  </p>
                </div>

                {/* Card Footer with Media Counts and Action */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    {practice.images?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#475569] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <ImageIcon className="w-3 h-3 text-[#4A6741]" />
                        <span>{practice.images.length} photos</span>
                      </span>
                    )}
                    {practice.competency?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#475569] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Target className="w-3 h-3 text-[#4A6741]" />
                        <span>{practice.competency.length} skills</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[#4A6741] font-semibold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Admin Add Best Practice Modal ───────────────────── */}
      {isAdmin && (
        <AddBestPracticeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPractice}
        />
      )}
    </div>
  );
}
