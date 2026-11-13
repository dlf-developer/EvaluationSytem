import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  BookOpenCheck,
  Compass,
  Award,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FILTER_OPTIONS, THEME_CONFIG } from "./bestPracticesData";

export default function AddBestPracticeModal({ isOpen, onClose, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0); // 0: Basic & Pedagogy, 1: Curriculum & Objectives, 2: TLP & Resources, 3: Documentation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    teacher: "",
    brief: "",
    duration: "",
    grade: [],
    theme: [],
    pedagogy: [],
    competency: [],
    atype: [],
    nep: [],
    lo: "",
    tlp: "",
    resources: "",
    atool_text: "",
    evid_text: "",
    remedial_text: "",
    refs: "",
    ksf: "",
    images: [],
  });

  const [customCompetency, setCustomCompetency] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Lock background scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const mainEl = document.querySelector("main") || document.querySelector('[role="main"]');
    const origMain = mainEl ? mainEl.style.overflow : "";
    if (mainEl) mainEl.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
      if (mainEl) mainEl.style.overflow = origMain;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle multi-select array fields
  const handleToggleArray = (field, value) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [field]: exists ? list.filter((i) => i !== value) : [...list, value],
      };
    });
  };

  // Add custom competency
  const handleAddCompetency = (e) => {
    e.preventDefault();
    const val = customCompetency.trim();
    if (val && !formData.competency.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        competency: [...prev.competency, val],
      }));
      setCustomCompetency("");
    }
  };

  // Remove competency
  const handleRemoveCompetency = (val) => {
    setFormData((prev) => ({
      ...prev,
      competency: prev.competency.filter((c) => c !== val),
    }));
  };

  // Handle local file upload to Base64
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        if (base64) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, base64],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add image by URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    const url = imageUrlInput.trim();
    if (url && !formData.images.includes(url)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
      setImageUrlInput("");
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim()) {
      setErrorMsg("Please enter a practice title.");
      setActiveStep(0);
      return;
    }

    if (!formData.teacher.trim()) {
      setErrorMsg("Please enter the teacher / contributor name.");
      setActiveStep(0);
      return;
    }

    if (!formData.brief.trim()) {
      setErrorMsg("Please provide a brief concept description.");
      setActiveStep(0);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create best practice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1050] overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-[#F5F0E8]/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A6741] text-white flex items-center justify-center shadow-sm">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D2A26]">
                Add New Best Practice
              </h2>
              <p className="text-xs text-[#5C5852]">
                Publish a new pedagogical practice to the repository for teachers and administrators.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-6 border-b border-gray-200 bg-gray-50/60 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { label: "1. Basic & Approach", icon: Compass },
            { label: "2. Curriculum & NEP", icon: Award },
            { label: "3. TLP & Execution", icon: Layers },
            { label: "4. Documentation", icon: ImageIcon },
          ].map((tab, idx) => {
            const IconComp = tab.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`inline-flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? "border-[#4A6741] text-[#4A6741]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto overscroll-contain space-y-6 text-xs text-[#2D2A26]">
          {/* STEP 0: BASIC & PEDAGOGY */}
          {activeStep === 0 && (
            <div className="space-y-5">
              {/* Practice Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Practice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Circle Time (Beginning / Goodbye / Reflection Time)"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-[#2D2A26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              {/* Teacher Name & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                    Teacher / Contributor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.teacher}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher: e.target.value })
                    }
                    placeholder="e.g. Dipika Bhanot"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-[#2D2A26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                    Recommended Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g. 15-20 minutes daily or 40 minutes"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-[#2D2A26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                </div>
              </div>

              {/* Concept Brief */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Concept Brief / Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.brief}
                  onChange={(e) =>
                    setFormData({ ...formData, brief: e.target.value })
                  }
                  placeholder="Provide a concise 2-4 sentence summary of what this practice is and the learning impact it produces..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-[#2D2A26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              {/* Target Grades (Pill Toggles) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  Target Grade Levels
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.grade.map((g) => {
                    const isSelected = formData.grade.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleToggleArray("grade", g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pedagogical Approaches */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  Pedagogical Approaches
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.pedagogy.map((p) => {
                    const isSelected = formData.pedagogy.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleToggleArray("pedagogy", p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: CURRICULUM & NEP */}
          {activeStep === 1 && (
            <div className="space-y-6">
              {/* Focus Themes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  Focus Themes (Select applicable)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.theme.map((t) => {
                    const isSelected = formData.theme.includes(t);
                    const themeColor = THEME_CONFIG[t]?.color || "#4A6741";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleArray("theme", t)}
                        style={{
                          backgroundColor: isSelected ? themeColor : "#F9FAFB",
                          color: isSelected ? "#FFFFFF" : "#374151",
                          borderColor: isSelected ? themeColor : "#E5E7EB",
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm"
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NEP 2020 Pillars */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  NEP 2020 Alignment (Select all aligned pillars)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FILTER_OPTIONS.nep.map((pillar) => {
                    const isSelected = formData.nep.includes(pillar);
                    return (
                      <label
                        key={pillar}
                        onClick={() => handleToggleArray("nep", pillar)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span>{pillar}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Types */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  Assessment Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.atype.map((a) => {
                    const isSelected = formData.atype.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handleToggleArray("atype", a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-[#4A6741] text-white border-[#4A6741]"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Competencies Developed */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Competencies Developed
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.competency.map((comp) => (
                    <span
                      key={comp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                    >
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(comp)}
                        className="hover:opacity-75"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCompetency}
                    onChange={(e) => setCustomCompetency(e.target.value)}
                    placeholder="e.g. Critical Thinking, Collaborative Dialogue"
                    className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompetency}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TLP & EXECUTION */}
          {activeStep === 2 && (
            <div className="space-y-5">
              {/* Learning Objectives */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Learning Objectives (Enter one objective per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.lo}
                  onChange={(e) =>
                    setFormData({ ...formData, lo: e.target.value })
                  }
                  placeholder={`1. Express thoughts confidently in a supportive circle.\n2. Develop active listening skills through reflection prompts.\n3. Build empathy and emotional security with peers.`}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              {/* Teaching Learning Process */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Teaching-Learning Process (Step-by-Step Execution)
                </label>
                <textarea
                  rows={5}
                  value={formData.tlp}
                  onChange={(e) =>
                    setFormData({ ...formData, tlp: e.target.value })
                  }
                  placeholder={`Step 1: Set the Stage - Gather learners and present the central focus prompt.\nStep 2: Core Activity - Facilitate round-robin sharing or collaborative inquiry.\nStep 3: Reflection - Summarize key takeaways and acknowledge growth.`}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              {/* Resources & Materials */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Required Resources & Classroom Materials
                </label>
                <input
                  type="text"
                  value={formData.resources}
                  onChange={(e) =>
                    setFormData({ ...formData, resources: e.target.value })
                  }
                  placeholder="e.g. Flash cards, green board, journals, emotion cards"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              {/* Assessment Tools & Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                    Assessment Tool
                  </label>
                  <input
                    type="text"
                    value={formData.atool_text}
                    onChange={(e) =>
                      setFormData({ ...formData, atool_text: e.target.value })
                    }
                    placeholder="e.g. Rubric, observation checklist, self-assessment"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                    Evidence of Learning
                  </label>
                  <input
                    type="text"
                    value={formData.evid_text}
                    onChange={(e) =>
                      setFormData({ ...formData, evid_text: e.target.value })
                    }
                    placeholder="e.g. Reflection sheets, student journals, charts"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                </div>
              </div>

              {/* Inclusivity & Key Success Factors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Inclusivity, Remedial & Extension Support
                </label>
                <textarea
                  rows={2}
                  value={formData.remedial_text}
                  onChange={(e) =>
                    setFormData({ ...formData, remedial_text: e.target.value })
                  }
                  placeholder="How is this practice adapted for diverse learners, special needs, and advanced students?"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Key Success Factors (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.ksf}
                  onChange={(e) =>
                    setFormData({ ...formData, ksf: e.target.value })
                  }
                  placeholder={`Safe and respectful environment\nConsistent daily routine\nPositive reinforcement and teacher empathy`}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTATION & PHOTOS */}
          {activeStep === 3 && (
            <div className="space-y-6">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-2">
                  Classroom Documentation Photos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#4A6741] transition bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 text-[#4A6741] flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-[#2D2A26]">
                    Upload classroom photos or student artifacts
                  </div>
                  <p className="text-[11px] text-[#5C5852] mt-1">
                    Select PNG, JPEG, or WebP files from your device.
                  </p>
                  <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-[#2D2A26] cursor-pointer hover:bg-gray-50 transition shadow-sm">
                    <ImageIcon className="w-4 h-4 text-[#4A6741]" />
                    <span>Choose Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Or Add by Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Or Add by Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/classroom-photo.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Photos Preview Grid */}
              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-3">
                    Attached Documentation ({formData.images.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50"
                      >
                        <img
                          src={src}
                          alt={`Uploaded artifact ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-lg hover:bg-red-600 transition"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Links */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2D2A26] mb-1.5">
                  Reference Materials & Citations
                </label>
                <input
                  type="text"
                  value={formData.refs}
                  onChange={(e) =>
                    setFormData({ ...formData, refs: e.target.value })
                  }
                  placeholder="e.g. CBSE Pedagogical Handbook 2024, DLF Experiential Framework"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#5C5852] hover:bg-gray-100 transition"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-5 py-2 bg-[#4A6741] text-white rounded-xl text-xs font-semibold hover:bg-[#2D3E27] transition shadow-sm"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#4A6741] text-white rounded-xl text-xs font-semibold hover:bg-[#2D3E27] transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Best Practice</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

