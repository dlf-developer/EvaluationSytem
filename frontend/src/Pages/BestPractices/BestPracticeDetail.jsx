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
} from "lucide-react";
import { THEME_CONFIG, FILTER_OPTIONS } from "./bestPracticesData";

// Step labels for teaching-learning process
const STEP_LABELS = [
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

  const handleCopyLink = useCallback(() => {
    if (!practice) return;
    const url = `${window.location.origin}/best-practices/${practice.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      })
      .catch(() => {
        // Fallback
      });
  }, [practice]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!practice) return null;

  return (
    <article
      data-testid="best-practice-detail"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 text-[#2D2A26] space-y-8 animate-in fade-in duration-200"
    >
      {/* ── Top Bar: Back Button, Breadcrumb & Action Toolbar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] hover:bg-[#F5F0E8]/40 transition shadow-2xs group"
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
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleBookmark(practice.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-2xs ${
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition shadow-2xs relative"
            title="Copy shareable link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-200 hover:border-[#4A6741] hover:text-[#4A6741] transition shadow-2xs"
            title="Print this practice"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ── Hero Header Card (Spacious, Clear & Comprehensive) ─── */}
      <header className="bg-white/80 backdrop-blur-xs rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-4">
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D2A26] tracking-tight leading-tight">
          {practice.title}
        </h1>

        {/* Author & School Attribution */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#5C5852] pt-1">
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

        {/* Editorial Abstract / Summary */}
        {practice.brief && (
          <div className="mt-4 p-4 sm:p-5 rounded-xl bg-[#F5F0E8]/70 border border-[#4A6741]/20 text-[#2D2A26] text-sm md:text-base leading-relaxed">
            <div className="text-xs font-bold uppercase tracking-wider text-[#4A6741] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Executive Summary & Purpose
            </div>
            <p className="text-stone-800">{practice.brief}</p>
          </div>
        )}
      </header>

      {/* ── 2-Column Responsive High-Density Widescreen Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Main Left Column (8 cols): Pedagogical Engine & Steps ─── */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Pedagogical Dimensions & Competencies */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
              <Target className="w-4 h-4" />
              Pedagogical Framework & Objectives
            </h2>

            {/* Matrix of tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pedagogies */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  Pedagogical Approaches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(practice.pedagogy || []).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Competencies */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Competencies Developed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(practice.competency || []).map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected Learning Outcomes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5852] mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6741]" />
                Expected Learning Outcomes
              </h3>
              <div className="space-y-2">
                {parsedObjectives.length > 0 ? (
                  parsedObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs text-[#2D2A26]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#4A6741]/10 text-[#4A6741] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{obj}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 italic p-3">
                    No structured objectives specified.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. Step-by-Step Teaching-Learning Process (TLP) */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
              <Layers className="w-4 h-4" />
              Step-by-Step Teaching-Learning Process
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
              {parsedSteps.map((stepText, idx) => {
                const stepHeader =
                  idx < STEP_LABELS.length ? STEP_LABELS[idx] : `Step ${idx + 1}`;
                return (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#4A6741] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <div className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-4 sm:p-5 ml-2 hover:border-[#4A6741]/40 transition">
                      <div className="text-xs font-bold text-[#4A6741] uppercase tracking-wider mb-1.5">
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
          </section>

          {/* 3. Evidence of Success & Impact */}
          {practice.evid_text && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                <CheckCircle2 className="w-4 h-4" />
                Evidence of Learning & Real Classroom Impact
              </h2>
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs sm:text-sm text-[#2D2A26] leading-relaxed whitespace-pre-line">
                {practice.evid_text}
              </div>
            </section>
          )}

          {/* 4. Remedial Strategies & Differentiated Learning */}
          {practice.remedial_text && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                <Info className="w-4 h-4" />
                Inclusivity & Remedial / Differentiated Support
              </h2>
              <div className="p-4 sm:p-5 rounded-xl bg-[#F5F0E8]/50 border border-stone-200/80 text-xs sm:text-sm text-[#2D2A26] leading-relaxed whitespace-pre-line">
                {practice.remedial_text}
              </div>
            </section>
          )}

          {/* 5. Classroom Documentation Photos (Gallery) */}
          {practice.images?.length > 0 && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-2 pb-2 border-b border-stone-100">
                <ImageIcon className="w-4 h-4" />
                Classroom Documentation & Artifacts ({practice.images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {practice.images.map((imgSrc, imgIdx) => (
                  <div
                    key={imgIdx}
                    onClick={() => setLightboxIndex(imgIdx)}
                    className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 cursor-pointer hover:opacity-90 hover:shadow-md transition relative group"
                  >
                    <img
                      src={imgSrc}
                      alt={`${practice.title} documentation ${imgIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      View
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Video Walkthrough Banner */}
          <section className="p-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 text-[#4A6741] flex items-center justify-center mb-3">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
            <h3 className="text-sm font-bold text-[#2D2A26]">
              Pedagogical Video Walkthrough Coming Soon
            </h3>
            <p className="mt-1 text-xs text-[#5C5852] max-w-sm">
              An instructional demonstration of this practice in active classroom settings is being recorded by DLF educators.
            </p>
            <span className="mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700">
              In Production
            </span>
          </section>
        </div>

        {/* ── Sidebar Right Area (4 cols): Sticky Quick Specs & NEP ─── */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Card 1: At a Glance Specifications */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <BookOpen className="w-4 h-4" />
              Practice Specifications
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="font-bold text-[#5C5852] block mb-1">
                  Target Grade Levels
                </span>
                <div className="flex flex-wrap gap-1">
                  {(practice.grade || []).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#5C5852] block mb-1">
                  Recommended Time
                </span>
                <span className="text-stone-800 font-medium">
                  {practice.duration || "Standard classroom period"}
                </span>
              </div>

              <div>
                <span className="font-bold text-[#5C5852] block mb-1">
                  Pedagogical Focus
                </span>
                <span className="text-stone-800 font-medium">
                  {(practice.pedagogy || []).join(", ") || "General Pedagogy"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Required Resources & Materials */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <BookOpen className="w-4 h-4" />
              What You Need (Resources & Materials)
            </h3>
            <div className="p-3.5 rounded-xl bg-[#F5F0E8]/50 border border-stone-200 text-xs text-[#2D2A26] leading-relaxed whitespace-pre-line">
              {practice.resources || "Standard classroom teaching aids and stationery."}
            </div>
          </div>

          {/* Card 3: Assessment & Evaluation Tools */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <CheckCircle2 className="w-4 h-4" />
              Assessment & Evaluation
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {(practice.atype || []).map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <Check className="w-3 h-3" />
                    {a}
                  </span>
                ))}
              </div>

              {practice.atool_text && (
                <div className="text-stone-700 pt-1">
                  <strong className="text-[#5C5852]">Assessment Tools:</strong>{" "}
                  {practice.atool_text}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: NEP 2020 Alignment */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <Award className="w-4 h-4" />
              National Education Policy (NEP 2020) Alignment
            </h3>

            <div className="space-y-1.5">
              {FILTER_OPTIONS.nep.map((pillar) => {
                const isAligned = (practice.nep || []).includes(pillar);
                return (
                  <div
                    key={pillar}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition ${
                      isAligned
                        ? "bg-emerald-50 text-emerald-900 font-medium"
                        : "text-stone-400"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isAligned ? "text-emerald-600" : "text-stone-300"
                      }`}
                    />
                    <span>{pillar}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 5: Key Success Factors (KSF) */}
          {practice.ksf && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <Lightbulb className="w-4 h-4" />
                Key Success Factors
              </h3>
              <div className="space-y-2 text-xs text-[#2D2A26]">
                {practice.ksf
                  .split(/\n/)
                  .map((l) => l.trim().replace(/^•\s*/, ""))
                  .filter(Boolean)
                  .map((line, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{line}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Card 6: References & Sources */}
          {practice.refs && practice.refs !== "NA" && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-2 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] pb-1 border-b border-stone-100">
                Reference Material & Links
              </h3>
              <p className="text-stone-600 whitespace-pre-line leading-relaxed">
                {practice.refs}
              </p>
            </div>
          )}

          {/* Card 7: Related Best Practices */}
          {relatedPractices.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6741] pb-1 border-b border-stone-100">
                Related Practices
              </h3>
              <div className="space-y-2">
                {relatedPractices.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectPractice(rel)}
                    className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#4A6741] hover:bg-[#F5F0E8]/40 transition flex items-center justify-between group"
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
        </aside>
      </div>

      {/* ── Bottom Navigation Bar ─── */}
      <div className="pt-6 border-t border-stone-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4A6741] text-white hover:bg-[#2D3E27] transition shadow-xs"
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
                className="p-2 rounded-full hover:bg-white/20 transition text-white"
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
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

