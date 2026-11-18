import React, { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Printer,
  Clock,
  Compass,
  GraduationCap,
  Target,
  Award,
  Layers,
  BookOpen,
  CheckCircle2,
  Check,
  Sparkles,
  Info,
  Lightbulb,
  Play,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Download,
  FileText,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { THEME_CONFIG, FILTER_OPTIONS } from "./bestPracticesData";

// Step labels for teaching-learning process
const STEP_LABELS = [
  "Set the Stage",
  "Get Started",
  "Core Activity",
  "Wrap Up & Reflect",
  "Extension & Follow-up",
];

// Helper to get initials from teacher name
const getTeacherInitials = (name = "") => {
  const clean = name.replace(/^(Ms\.|Mr\.|Dr\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Theme color getter
const getThemeStyle = (themeName) => {
  const config = THEME_CONFIG[themeName];
  if (!config) {
    return {
      color: "#4A6741",
      backgroundColor: "rgba(74, 103, 65, 0.10)",
      borderColor: "rgba(74, 103, 65, 0.25)",
    };
  }
  return {
    color: config.color,
    backgroundColor: config.bg,
    borderColor: config.border,
  };
};

export default function BestPracticeDetail({
  practice,
  onBack,
  onSelectPractice,
  isBookmarked,
  onToggleBookmark,
  relatedPractices = [],
}) {
  const [activeTab, setActiveTab] = useState("delivery"); // "delivery" | "framework" | "assessment" | "inclusivity" | "all"
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Parse learning objectives
  const parsedObjectives = useMemo(() => {
    if (!practice?.lo) return [];
    const raw = practice.lo
      .replace(/^Students will be able to:[\s]*/i, "")
      .trim();

    return raw
      .split(/\n/)
      .map((line) => line.replace(/^\d+[.)]\s*/, "").replace(/^•\s*/, "").trim())
      .filter(Boolean);
  }, [practice]);

  // Parse TLP steps
  const parsedSteps = useMemo(() => {
    if (!practice?.tlp) return [];
    const raw = practice.tlp.trim();
    const splitRegex = /(?:^|\n)(?:Step\s*\d+[:.]?|\d+[.)])\s*/i;
    const parts = raw
      .split(splitRegex)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [raw];
  }, [practice]);

  // Parse resources
  const parsedResources = useMemo(() => {
    if (!practice?.resources) return [];
    return practice.resources
      .split(/\n/)
      .map((l) => l.trim().replace(/^•\s*/, ""))
      .filter(Boolean);
  }, [practice]);

  // Parse key success factors
  const parsedKsf = useMemo(() => {
    if (!practice?.ksf) return [];
    return practice.ksf
      .split(/\n/)
      .map((l) => l.trim().replace(/^•\s*/, ""))
      .filter(Boolean);
  }, [practice]);

  const handleCopyLink = useCallback(() => {
    if (!practice) return;
    const url = `${window.location.origin}/best-practices/${practice.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      })
      .catch(() => {});
  }, [practice]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadDocx = useCallback(() => {
    const a = document.createElement("a");
    a.href = "/templates/DLF_Best_Practice_Template.docx";
    a.download = "DLF_Best_Practice_Template.docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  if (!practice) return null;

  const nepAlignedCount = (practice.nep || []).length;
  const gradeList = (practice.grade || []).join(", ") || "All Grades";

  return (
    <article
      data-testid="best-practice-detail"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-7 text-[#2D2A26] space-y-6 animate-in fade-in duration-200"
    >
      {/* ── Top Bar: Back Button, Breadcrumb & Action Toolbar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-stone-200/90">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] hover:bg-[#F5F0E8]/40 transition shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-stone-500 group-hover:text-[#4A6741] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Best Practices</span>
          </button>

          <span className="text-stone-300">/</span>

          <span className="text-xs font-medium text-[#5C5852] truncate max-w-xs sm:max-w-md">
            Practice #{practice.id}
          </span>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleBookmark(practice.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-2xs cursor-pointer ${
              isBookmarked
                ? "bg-[#4A6741] text-white border-[#4A6741]"
                : "bg-white text-stone-700 border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741]"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this practice"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
            <span>{isBookmarked ? "Saved" : "Save Practice"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition shadow-2xs cursor-pointer"
            title="Copy shareable link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition shadow-2xs cursor-pointer"
            title="Print or export to PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/30 hover:bg-[#4A6741] hover:text-white transition shadow-2xs cursor-pointer"
            title="Download editable Best Practice Template (.docx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Documentation Template</span>
          </button>
        </div>
      </div>

      {/* ── Hero Profile Card (Clear, Engaging, Highly Legible) ─── */}
      <header className="bg-white/90 backdrop-blur-xs rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
        {/* Meta badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#4A6741] text-white shadow-2xs">
            Practice #{practice.id}
          </span>

          {(practice.grade || []).map((g) => (
            <span
              key={g}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80"
            >
              {g}
            </span>
          ))}

          {practice.duration && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
              <Clock className="w-3.5 h-3.5" />
              {practice.duration}
            </span>
          )}

          {(practice.theme || []).map((t) => (
            <span
              key={t}
              style={getThemeStyle(t)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2A26] tracking-tight leading-snug">
          {practice.title}
        </h1>

        {/* Author Attribution */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#5C5852]">
          <div className="w-7 h-7 rounded-full bg-[#4A6741]/15 text-[#4A6741] font-bold text-xs flex items-center justify-center shrink-0">
            {getTeacherInitials(practice.teacher)}
          </div>
          <span>
            Developed by{" "}
            <strong className="text-[#2D2A26] font-semibold">
              {practice.teacher}
            </strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-[#4A6741] font-medium">DLF Public School</span>
        </div>

        {/* Executive Summary */}
        {practice.brief && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#F5F0E8]/70 border border-[#4A6741]/20 text-[#2D2A26] text-xs sm:text-sm leading-relaxed">
            <div className="text-xs font-bold uppercase tracking-wider text-[#4A6741] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Summary & Purpose
            </div>
            <p className="text-stone-800 leading-relaxed">{practice.brief}</p>
          </div>
        )}

        {/* ── Quick-Specs KPI Strip: High-Density Meta Bar ─── */}
        <div className="pt-2 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-stone-200/70">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Target Grade Levels
            </div>
            <div className="text-xs font-semibold text-[#2D2A26] truncate">
              {gradeList}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Recommended Time
            </div>
            <div className="text-xs font-semibold text-[#2D2A26] truncate">
              {practice.duration || "Standard class period"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Core Pedagogy
            </div>
            <div className="text-xs font-semibold text-[#2D2A26] truncate">
              {(practice.pedagogy || []).slice(0, 2).join(" · ") || "Experiential Learning"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-[#4A6741]" />
              National Education Policy (NEP 2020) Alignment
            </div>
            <div className="text-xs font-semibold text-[#4A6741]">
              {nepAlignedCount > 0 ? `${nepAlignedCount} Focus Pillars Aligned` : "Core Curriculum Aligned"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Modern Segmented / Pill Tabbing Bar ─── */}
      <nav
        aria-label="Practice Sections"
        className="sticky top-2 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none whitespace-nowrap ${
            activeTab === "delivery"
              ? "bg-[#4A6741] text-white shadow-xs"
              : "text-stone-700 hover:text-[#4A6741] hover:bg-stone-100/70"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Classroom Delivery</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "delivery"
                ? "bg-white/25 text-white"
                : "bg-stone-200 text-stone-700"
            }`}
          >
            {parsedSteps.length} Steps
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("framework")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none whitespace-nowrap ${
            activeTab === "framework"
              ? "bg-[#4A6741] text-white shadow-xs"
              : "text-stone-700 hover:text-[#4A6741] hover:bg-stone-100/70"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Pedagogy & NEP 2020</span>
          {nepAlignedCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "framework"
                  ? "bg-white/25 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {nepAlignedCount} NEP
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("assessment")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none whitespace-nowrap ${
            activeTab === "assessment"
              ? "bg-[#4A6741] text-white shadow-xs"
              : "text-stone-700 hover:text-[#4A6741] hover:bg-stone-100/70"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Assessment & Impact</span>
          {practice.evid_text && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "assessment"
                  ? "bg-white/25 text-white"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              Evidence
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inclusivity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none whitespace-nowrap ${
            activeTab === "inclusivity"
              ? "bg-[#4A6741] text-white shadow-xs"
              : "text-stone-700 hover:text-[#4A6741] hover:bg-stone-100/70"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Inclusivity & Media</span>
          {(practice.images || []).length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "inclusivity"
                  ? "bg-white/25 text-white"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {practice.images.length} Photos
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none whitespace-nowrap ml-auto ${
            activeTab === "all"
              ? "bg-stone-800 text-white shadow-xs"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/70"
          }`}
          title="View all sections in one continuous view"
        >
          <BookOpen className="w-4 h-4" />
          <span>All Sections</span>
        </button>
      </nav>

      {/* ── TAB 1: Classroom Delivery (Step-by-Step TLP + Resources + Outcomes) ─── */}
      {(activeTab === "delivery" || activeTab === "all") && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Step-by-Step Process */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Step-by-Step Teaching-Learning Process
                </h2>
                <span className="text-xs font-medium text-[#5C5852]">
                  {parsedSteps.length} actionable phases
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                {parsedSteps.map((stepText, idx) => {
                  const stepHeader =
                    idx < STEP_LABELS.length ? STEP_LABELS[idx] : `Step ${idx + 1}`;
                  return (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#4A6741] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                      <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-4 ml-2 hover:border-[#4A6741]/40 hover:bg-white transition shadow-2xs">
                        <div className="text-xs font-bold text-[#4A6741] uppercase tracking-wider mb-1">
                          {stepHeader}
                        </div>
                        <p className="text-xs sm:text-sm text-[#2D2A26] leading-relaxed whitespace-pre-line">
                          {stepText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Example in Action Callout if available */}
              {practice.example_action && (
                <div className="p-4 rounded-xl bg-[#F5F0E8]/70 border border-[#4A6741]/25 text-xs sm:text-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4A6741] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Example in Action
                  </div>
                  <p className="text-stone-800 leading-relaxed">{practice.example_action}</p>
                </div>
              )}
            </div>

            {/* Right 5 Columns: What You Need & Learning Outcomes */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: What You Need (Resources) */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                  <BookOpen className="w-4 h-4" />
                  What You Need (Resources & Materials)
                </h3>

                {parsedResources.length > 0 ? (
                  <div className="space-y-2">
                    {parsedResources.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs text-[#2D2A26]"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-[#4A6741] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{res}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-[#5C5852] leading-relaxed">
                    {practice.resources || "Standard classroom stationery, worksheets, and teaching aids."}
                  </div>
                )}
              </div>

              {/* Card 2: Expected Learning Outcomes */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Expected Learning Outcomes
                </h3>

                <div className="space-y-2">
                  {parsedObjectives.length > 0 ? (
                    parsedObjectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200/60 text-xs text-[#2D2A26]"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#4A6741]/15 text-[#4A6741] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{obj}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-400 italic p-3">
                      Standard competence acquisition.
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Session Duration & Frequency */}
              <div className="bg-[#FAFBF9] rounded-2xl p-4 border border-stone-200/90 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#5C5852] block">Execution Cadence</span>
                  <span className="text-[#2D2A26] font-medium">
                    {practice.duration || "Standard class period (40 mins)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 2: Pedagogy & NEP 2020 Framework ─── */}
      {(activeTab === "framework" || activeTab === "all") && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Columns: Pedagogical Matrix & Competencies */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                <Target className="w-4 h-4" />
                Pedagogical Matrix & Competencies
              </h2>

              {/* Approaches */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  Pedagogical Approaches
                </div>
                <div className="flex flex-wrap gap-2">
                  {(practice.pedagogy || []).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Competencies */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Competencies Developed
                </div>
                <div className="flex flex-wrap gap-2">
                  {(practice.competency || []).map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Grades */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Target Grade Levels
                </div>
                <div className="flex flex-wrap gap-2">
                  {(practice.grade || []).map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 6 Columns: NEP 2020 8-Pillar Alignment & Key Success Factors */}
            <div className="lg:col-span-6 space-y-6">
              {/* NEP 2020 Pillar Grid */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    National Education Policy (NEP 2020) Alignment
                  </h3>
                  <span className="text-[11px] font-bold text-[#4A6741] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {nepAlignedCount} of 8 Pillars Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {FILTER_OPTIONS.nep.map((pillar) => {
                    const isAligned = (practice.nep || []).includes(pillar);
                    return (
                      <div
                        key={pillar}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                          isAligned
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold shadow-2xs"
                            : "bg-stone-50/50 border-stone-200/60 text-stone-400"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isAligned ? "text-emerald-700 font-bold" : "text-stone-300"
                          }`}
                        />
                        <span className="leading-tight">{pillar}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Success Factors */}
              {parsedKsf.length > 0 && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                    <Lightbulb className="w-4 h-4" />
                    Key Success Factors
                  </h3>
                  <div className="space-y-2 text-xs">
                    {parsedKsf.map((line, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/70 text-[#2D2A26]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 3: Assessment & Impact ─── */}
      {(activeTab === "assessment" || activeTab === "all") && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Columns: Evidence of Learning & Classroom Impact */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                <CheckCircle2 className="w-4 h-4" />
                Evidence of Learning & Real Classroom Impact
              </h2>

              {practice.evid_text ? (
                <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs sm:text-sm text-[#2D2A26] leading-relaxed whitespace-pre-line">
                  {practice.evid_text}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-[#5C5852] italic">
                  Documented through regular student engagement and class observations.
                </div>
              )}
            </div>

            {/* Right 6 Columns: Assessment Types & Tools Used */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <CheckCircle2 className="w-4 h-4" />
                Assessment Strategy & Tools
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-[#5C5852] block mb-2">
                    Assessment Types Implemented:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(practice.atype || []).map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-emerald-700" />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {practice.atool_text && (
                  <div className="pt-3 border-t border-stone-100">
                    <span className="font-bold text-[#5C5852] block mb-1.5">
                      Assessment Tools & Rubrics:
                    </span>
                    <p className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 leading-relaxed whitespace-pre-line">
                      {practice.atool_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 4: Inclusivity & Media (Photos, Video, References, Related) ─── */}
      {(activeTab === "inclusivity" || activeTab === "all") && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Columns: Inclusivity & Differentiation */}
            <div className="lg:col-span-6 space-y-6">
              {/* Inclusivity Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-3.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Info className="w-4 h-4" />
                  Inclusivity & Remedial / Differentiated Support
                </h2>
                <div className="p-4 rounded-xl bg-[#F5F0E8]/60 border border-stone-200 text-xs sm:text-sm text-[#2D2A26] leading-relaxed whitespace-pre-line">
                  {practice.remedial_text ||
                    "This practice is designed to be inclusive and accessible to all learners. Scaffolded prompts and peer buddy arrangements support learners at every stage of growth."}
                </div>
              </div>

              {/* Reference Material */}
              {practice.refs && practice.refs !== "NA" && (
                <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-2.5 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] pb-1 border-b border-stone-100">
                    Reference Materials & Links
                  </h3>
                  <p className="text-stone-700 whitespace-pre-line leading-relaxed">
                    {practice.refs}
                  </p>
                </div>
              )}

              {/* Related Practices */}
              {relatedPractices.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] pb-1 border-b border-stone-100">
                    Related Best Practices
                  </h3>
                  <div className="space-y-2">
                    {relatedPractices.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelectPractice(rel)}
                        className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-[#4A6741] hover:bg-[#F5F0E8]/40 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-[#2D2A26] truncate group-hover:text-[#4A6741]">
                            {rel.title}
                          </div>
                          <div className="text-[11px] text-[#5C5852] mt-0.5">
                            {rel.teacher}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#4A6741] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 6 Columns: Photos & Video */}
            <div className="lg:col-span-6 space-y-6">
              {/* Photo Gallery */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                  <ImageIcon className="w-4 h-4" />
                  Classroom Documentation & Artifacts ({practice.images?.length || 0})
                </h3>

                {practice.images?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {practice.images.map((imgSrc, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setLightboxIndex(imgIdx)}
                        className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 cursor-pointer hover:opacity-95 hover:shadow-md transition relative group"
                      >
                        <img
                          src={imgSrc}
                          alt={`${practice.title} photo ${imgIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-stone-200 text-center text-xs text-[#5C5852] bg-stone-50/60">
                    Photographic documentation is archived in school portfolios.
                  </div>
                )}
              </div>

              {/* Video Walkthrough Card */}
              <div className="p-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#4A6741]/10 text-[#4A6741] flex items-center justify-center mb-2.5">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
                <h4 className="text-xs font-bold text-[#2D2A26]">
                  Pedagogical Video Walkthrough Coming Soon
                </h4>
                <p className="mt-1 text-[11px] text-[#5C5852] max-w-sm">
                  Demonstration lessons in active classroom settings are recorded by DLF educators.
                </p>
                <span className="mt-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700">
                  In Production
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom Navigation Bar ─── */}
      <div className="pt-6 border-t border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#3d5635] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Best Practices</span>
        </button>

        <span className="text-xs text-[#5C5852]">
          DLF Public School • Curated Best Practices Repository
        </span>
      </div>

      {/* ── Photo Lightbox Overlay (Only if clicked) ─── */}
      {lightboxIndex !== null &&
        practice?.images?.[lightboxIndex] &&
        createPortal(
          <div className="fixed inset-0 z-[1200] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
              <span className="text-xs font-semibold">
                {lightboxIndex + 1} of {practice.images.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full hover:bg-white/20 transition text-white cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
              <img
                src={practice.images[lightboxIndex]}
                alt={`${practice.title} documentation ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />

              {practice.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev === 0 ? practice.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev === practice.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
