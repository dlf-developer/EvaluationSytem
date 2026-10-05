import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Fillter_Wing from "./Fillter_Wing";
import { getAllTimes } from "../../../../Utils/auth";
import {
  GetSingleWingFrom,
  updateWingForm,
  WingPublished,
  syncWingForm,
} from "../../../../redux/userSlice";
import { useNavigate, useParams } from "react-router-dom";
import { inputsWing } from "./wing";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  VStack,
  HStack,
  Progress,
  useToast,
} from "@chakra-ui/react";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const FORM_TITLES = [
  { key: "form1", label: "Fortnightly Monitor", color: "green" },
  { key: "form2", label: "Classroom Walkthrough", color: "blue" },
  { key: "form3", label: "Notebook Checking Proforma", color: "purple" },
  { key: "form5", label: "Co-Scholastic Classroom Observation", color: "teal" },
  { key: "form4", label: "Learning Progress Checklist", color: "orange" },
];

// ── Score helpers ─────────────────────────────────────────────────────────────
const getTotalScore = (items, type, formType) => {
  if (formType === "form1") {
    if (!items) return 0;
    const valid = ["Yes", "Sometimes", "No"];
    return Object.values(items[type] || {}).reduce(
      (s, v) => s + (valid.includes(v) ? 1 : 0),
      0,
    );
  }
  if (formType === "form2") {
    const sections = [
      "essentialAggrements",
      "planingAndPreparation",
      "classRoomEnvironment",
      "instruction",
    ];
    let out = 0;
    sections.forEach((sec) =>
      (items[sec] || []).forEach((item) => {
        if (["1", "2", "3", "4"].includes(item?.answer)) out += 4;
      }),
    );
    return out;
  }
  if (formType === "form3") {
    const keys = [
      "maintenanceOfNotebooks",
      "qualityOfOppurtunities",
      "qualityOfTeacherFeedback",
      "qualityOfLearner",
    ];
    const data = items[type];
    let out = 0;
    keys.forEach((k) =>
      (data?.[k] || []).forEach((item) => {
        if (["1", "2", "3"].includes(item?.answer)) out += 3;
      }),
    );
    return out;
  }
  return 0;
};

const getSelfScore = (items, type, formType) => {
  if (formType === "form1") {
    if (!items) return 0;
    const vals = { Yes: 1, Sometimes: 0.5 };
    return Object.values(items[type] || {}).reduce(
      (s, v) => s + (vals[v] || 0),
      0,
    );
  }
  if (formType === "form2") {
    const sections = [
      "essentialAggrements",
      "planingAndPreparation",
      "classRoomEnvironment",
      "instruction",
    ];
    let total = 0;
    sections.forEach((sec) =>
      (items[sec] || []).forEach((item) => {
        if (["1", "2", "3", "4"].includes(item?.answer))
          total += parseInt(item.answer, 10);
      }),
    );
    return total;
  }
  if (formType === "form3") {
    const keys = [
      "maintenanceOfNotebooks",
      "qualityOfOppurtunities",
      "qualityOfTeacherFeedback",
      "qualityOfLearner",
    ];
    const data = items[type];
    let total = 0;
    keys.forEach((k) =>
      (data?.[k] || []).forEach((item) => {
        if (["1", "2", "3"].includes(item?.answer))
          total += parseInt(item.answer, 10);
      }),
    );
    return total;
  }
  return 0;
};

const pct = (score, total) =>
  total > 0 ? ((score / total) * 100).toFixed(1) : null;

// ── Score Badge ───────────────────────────────────────────────────────────────
const ScorePill = ({ label, value }) =>
  value ? (
    <HStack spacing={1}>
      <Text fontSize="xs" color="gray.500">
        {label}:
      </Text>
      <Badge
        px={2}
        py={0.5}
        borderRadius="full"
        bg="brand.primary"
        color="white"
        fontSize="xs"
        fontWeight="600"
      >
        {value}%
      </Badge>
    </HStack>
  ) : null;

// ── File Upload Component (Custom React + Tailwind CSS - Drag & Drop PDF) ─────
const FileUploadField = ({ files = [], onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const processFiles = async (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter((file) => {
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        toast({
          title: `${file.name} is not a PDF`,
          description: "Only PDF files are allowed.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      return isPdf;
    });

    if (pdfFiles.length === 0) return;

    try {
      const convertedFiles = await Promise.all(
        pdfFiles.map(async (file) => {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

          return {
            uid: file.uid || Date.now().toString() + Math.random().toString(36).substring(2, 5),
            name: file.name,
            status: "done",
            url: base64,
            type: "application/pdf",
            size: file.size,
          };
        })
      );

      onChange([...files, ...convertedFiles]);
    } catch {
      toast({
        title: "Upload Failed",
        description: "Failed to read uploaded file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (uid) => {
    onChange(files.filter((f) => f.uid !== uid));
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="text-xs font-semibold text-slate-700 mb-2">
        Upload PDF Attachments (Drag & drop or select PDF files):
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 bg-white ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-emerald-600 hover:bg-slate-50/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            Click or drag PDF files to this area to upload
          </div>
          <div className="text-xs text-slate-400">
            Supports PDF documents only (.pdf)
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-xs font-bold text-slate-600">
            PDF Document Previews ({files.length}):
          </div>
          {files.map((file, fIdx) => (
            <div
              key={file.uid || fIdx}
              className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-700 truncate max-w-md">
                  📄 {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file.uid);
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Remove
                </button>
              </div>
              {file.url && (
                <div className="h-[400px] w-full bg-slate-50">
                  <iframe
                    src={file.url}
                    title={file.name}
                    width="100%"
                    height="100%"
                    className="border-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Step Indicator ─────────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <Flex align="center" gap={3} mb={8}>
    {[
      { n: 1, label: "Monthly Report" },
      { n: 2, label: "Form Selection" },
      { n: 3, label: "Review & Publish" },
    ].map(({ n, label }, i) => {
      const done = current > n;
      const active = current === n;
      return (
        <React.Fragment key={n}>
          <Flex align="center" gap={2}>
            <Flex
              w={8}
              h={8}
              borderRadius="full"
              align="center"
              justify="center"
              fontWeight="700"
              fontSize="sm"
              bg={
                done ? "brand.primary" : active ? "brand.primary" : "gray.200"
              }
              color={done || active ? "white" : "gray.500"}
              transition="all 0.2s"
            >
              {done ? <CheckCircleOutlined /> : n}
            </Flex>
            <Text
              fontSize="sm"
              fontWeight={active ? "600" : "400"}
              color={active ? "brand.text" : "gray.500"}
            >
              {label}
            </Text>
          </Flex>
          {i < 2 && (
            <Box
              flex={1}
              h="2px"
              bg={current > n ? "brand.primary" : "gray.200"}
              borderRadius="full"
              transition="background 0.3s"
            />
          )}
        </React.Fragment>
      );
    })}
  </Flex>
);

// ─────────────────────────────────────────────────────────────────────────────
function OB_Wing() {
  const { getFilteredDataList, loading } = useSelector((s) => s?.user);
  const [formData, setFormData] = useState();
  const [currForm, setCurrForm] = useState();
  const [currStep, setCurrStep] = useState(1);
  const [syncing, setSyncing] = useState({});
  const [syncingAll, setSyncingAll] = useState(false);

  // Custom React form state
  const [formName, setFormName] = useState("");
  const [monthlyReport, setMonthlyReport] = useState(() =>
    inputsWing.map((inp) => ({
      question: inp.question,
      type: inp.type,
      columns: inp.columns,
      allowFileUpload: inp.allowFileUpload,
      answer: "",
      tableData: [{}],
      files: [],
    }))
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const id = useParams()?.id;
  const DRAFT_KEY = `wing-coordinator-draft-${id}`;

  const [selectedItems, setSelectedItems] = useState({
    form1: [],
    form2: [],
    form3: [],
    form4: [],
    form5: [],
  });

  const updateReportItem = (index, patch) => {
    setMonthlyReport((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
    if (validationErrors[`question_${index}`] && patch.answer?.trim()) {
      setValidationErrors((prev) => ({ ...prev, [`question_${index}`]: null }));
    }
  };

  const hasAnyReportContent = (name, report) => {
    if (name && name.trim().length > 0) return true;
    if (!Array.isArray(report)) return false;
    return report.some((item) => {
      if (item.answer && item.answer.trim().length > 0) return true;
      if (Array.isArray(item.files) && item.files.length > 0) return true;
      if (Array.isArray(item.tableData)) {
        return item.tableData.some((row) =>
          Object.values(row || {}).some(
            (v) => v !== "" && v !== null && v !== undefined && v !== false
          )
        );
      }
      return false;
    });
  };

  const handleAutoSave = (customReport, customFormName) => {
    try {
      const rep = customReport !== undefined ? customReport : monthlyReport;
      const name = customFormName !== undefined ? customFormName : formName;
      if (hasAnyReportContent(name, rep)) {
        const draftData = {
          formName: name,
          monthlyReport: rep,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setLastSavedTime(new Date());
      }
    } catch (err) {
      console.warn("Auto-save to localStorage failed", err);
    }
  };

  // Debounced auto-save effect on state change
  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 600);
    return () => clearTimeout(timer);
  }, [formName, monthlyReport, isInitialized]);

  const addTableRow = (index) => {
    setMonthlyReport((prev) => {
      const updated = prev.map((item, i) =>
        i === index
          ? { ...item, tableData: [...(item.tableData || []), {}] }
          : item
      );
      handleAutoSave(updated);
      return updated;
    });
  };

  const removeTableRow = (index, rowIndex) => {
    setMonthlyReport((prev) => {
      const updated = prev.map((item, i) =>
        i === index
          ? {
              ...item,
              tableData: (item.tableData || []).filter((_, rIdx) => rIdx !== rowIndex),
            }
          : item
      );
      handleAutoSave(updated);
      return updated;
    });
  };

  const updateTableCell = (index, rowIndex, cellKey, value) => {
    setMonthlyReport((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const currentRows = item.tableData || [{}];
        const updatedRows = currentRows.map((row, rIdx) =>
          rIdx === rowIndex ? { ...row, [cellKey]: value } : row
        );
        return { ...item, tableData: updatedRows };
      })
    );
  };

  // ── Sync a single form type ──────────────────────────────────────────────
  const handleSync = async (formKey) => {
    setSyncing((prev) => ({ ...prev, [formKey]: true }));
    try {
      const res = await dispatch(syncWingForm(id)).unwrap();
      if (res?.success) {
        const fresh = res.data;
        setSelectedItems((prev) => {
          const freshArr = fresh[formKey] || [];
          const updatedSelected = (prev[formKey] || []).map((sel) => {
            const match = freshArr.find((f) => f._id === (sel._id || sel));
            return match || sel;
          });
          return { ...prev, [formKey]: updatedSelected };
        });
        setCurrForm(fresh);
        toast({
          title: "Synced",
          description: `✅ ${FORM_TITLES.find((f) => f.key === formKey)?.label} synced!`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Sync failed",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Sync failed",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSyncing((prev) => ({ ...prev, [formKey]: false }));
    }
  };

  // ── Sync all form types at once ──────────────────────────────────────────
  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await dispatch(syncWingForm(id)).unwrap();
      if (res?.success) {
        const fresh = res.data;
        setSelectedItems((prev) => {
          const updated = {};
          ["form1", "form2", "form3", "form4", "form5"].forEach((key) => {
            const freshArr = fresh[key] || [];
            updated[key] = (prev[key] || []).map((sel) => {
              const match = freshArr.find((f) => f._id === (sel._id || sel));
              return match || sel;
            });
          });
          return updated;
        });
        setCurrForm(fresh);
        toast({
          title: "Synced",
          description: "✅ All reports synced with latest data!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Sync failed",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Sync failed",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSyncingAll(false);
    }
  };

  // ── Load existing form ──
  useEffect(() => {
    const load = async () => {
      const res = await dispatch(GetSingleWingFrom(id));
      if (res?.payload?.success) {
        if (res.payload.data?.isComplete && !res.payload.data?.isDraft) {
          navigate("/wing-coordinator");
        } else {
          setCurrForm(res.payload.data);
        }
      } else {
        toast({
          title: "Error loading form",
          description: "Could not load form. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    load();
  }, [dispatch, id]);

  useEffect(() => {
    if (currForm) {
      setFormName(currForm.formName || "");
      const serverReport = Array.isArray(currForm.monthlyReport) ? currForm.monthlyReport : [];
      let initialReport = inputsWing.map((inp, idx) => {
        const existing = serverReport[idx];
        return {
          question: inp.question,
          type: inp.type,
          columns: inp.columns,
          allowFileUpload: inp.allowFileUpload,
          answer: existing?.answer || "",
          tableData:
            Array.isArray(existing?.tableData) && existing.tableData.length > 0
              ? existing.tableData
              : [{}],
          files: Array.isArray(existing?.files)
            ? existing.files
            : existing?.files && typeof existing.files === "object"
            ? Object.values(existing.files)
            : [],
        };
      });

      setSelectedItems({
        form1: currForm?.form1 || [],
        form2: currForm?.form2 || [],
        form3: currForm?.form3 || [],
        form4: currForm?.form4 || [],
        form5: currForm?.form5 || [],
      });

      // 2. If localStorage has a more-recent draft, overlay the monthlyReport
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft?.formName) {
            setFormName(draft.formName);
          }
          if (Array.isArray(draft?.monthlyReport) && draft.monthlyReport.length > 0) {
            initialReport = inputsWing.map((inp, idx) => {
              const draftItem = draft.monthlyReport[idx] || initialReport[idx];
              return {
                question: inp.question,
                type: inp.type,
                columns: inp.columns,
                allowFileUpload: inp.allowFileUpload,
                answer: draftItem?.answer ?? initialReport[idx]?.answer ?? "",
                tableData:
                  Array.isArray(draftItem?.tableData) && draftItem.tableData.length > 0
                    ? draftItem.tableData
                    : initialReport[idx]?.tableData || [{}],
                files: Array.isArray(draftItem?.files)
                  ? draftItem.files
                  : initialReport[idx]?.files || [],
              };
            });
            if (draft?.lastSaved) {
              setLastSavedTime(new Date(draft.lastSaved));
            }
            toast({
              title: "Draft Restored",
              description: "📋 Draft restored from your last session.",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      } catch (_) {}

      setMonthlyReport(initialReport);
      setIsInitialized(true);
    }
  }, [currForm]);

  const handleSelect = (checked, item, type) => {
    setSelectedItems((prev) => ({
      ...prev,
      [type]: checked
        ? [...prev[type], item]
        : prev[type].filter((i) => i._id !== item._id),
    }));
  };

  const handleSave = async (silent = false) => {
    const isSilent = silent === true;
    if (!isSilent) setSaving(true);
    try {
      const { className, range } = formData || {};
      const { form1, form2, form3, form4, form5 } = selectedItems;
      const checkdata = {
        monthlyReport,
        className,
        range,
        form1,
        form2,
        form3,
        form4,
        form5,
        formName,
        isDraft: true,
      };
      const res = await dispatch(updateWingForm({ id, checkdata })).unwrap();
      if (res?.success) {
        setLastSavedTime(new Date());
        if (!isSilent) {
          toast({
            title: "Saved successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        if (!isSilent) {
          toast({
            title: "Save failed",
            description: "Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } finally {
      if (!isSilent) setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { className, range } = formData || {};
      const { form1, form2, form3, form4, form5 } = selectedItems;
      const checkdata = {
        className,
        range,
        form1,
        form2,
        form3,
        form4,
        form5,
        isDraft: false,
        isComplete: true,
        monthlyReport,
        formName,
      };
      const res = await dispatch(WingPublished({ id, checkdata })).unwrap();
      if (res?.success) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (_) {}
        toast({
          title: "Published successfully",
          description: "Form published successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/wing-coordinator");
      }
    } finally {
      setPublishing(false);
    }
  };

  const validateStepOne = () => {
    const errors = {};
    if (!formName || !formName.trim()) {
      errors.formName = "Please enter a form name!";
    }
    inputsWing.forEach((item, i) => {
      if (item.type === "text") {
        const ans = monthlyReport[i]?.answer;
        if (!ans || !ans.trim()) {
          errors[`question_${i}`] = "Please enter a response";
        }
      }
    });

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields before proceeding.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return false;
    }
    return true;
  };

  // ── Monthly Report Section (Custom React + Tailwind CSS) ───────────────────
  const renderMonthlyReport = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Monthly Report</h2>
        <p className="text-sm text-slate-500">
          Fill in each activity for this wing's monthly summary.
        </p>
      </div>

      {/* Form Name field */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Form Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formName}
          onChange={(e) => {
            setFormName(e.target.value);
            if (validationErrors.formName) {
              setValidationErrors((prev) => ({ ...prev, formName: null }));
            }
          }}
          onBlur={handleAutoSave}
          placeholder="Enter a name for this report…"
          className={`w-full px-4 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all shadow-sm ${
            validationErrors.formName
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-300 focus:ring-emerald-500 focus:border-transparent"
          }`}
        />
        {validationErrors.formName && (
          <p className="text-xs text-red-500 mt-1.5">{validationErrors.formName}</p>
        )}
      </div>

      <div className="space-y-4">
        {inputsWing.map((item, index) => {
          const reportItem = monthlyReport[index] || {};
          const tableRows = reportItem.tableData || [{}];

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 capitalize">
                    {item.question}
                  </h4>

                  {item.type === "text" ? (
                    <div>
                      <textarea
                        value={reportItem.answer || ""}
                        onChange={(e) => updateReportItem(index, { answer: e.target.value })}
                        onBlur={handleAutoSave}
                        placeholder="Enter your response…"
                        rows={2}
                        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all shadow-sm resize-y ${
                          validationErrors[`question_${index}`]
                            ? "border-red-400 focus:ring-red-400"
                            : "border-slate-300 focus:ring-emerald-500 focus:border-transparent"
                        }`}
                      />
                      {validationErrors[`question_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {validationErrors[`question_${index}`]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
                      <div className="min-w-max">
                        {/* Table Headers */}
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <div className="w-[45px] text-center text-xs font-bold text-slate-500">
                            S.No.
                          </div>
                          {(item.columns || []).map((col, colIdx) => {
                            const isCheckbox = col === "Ticket Raised" || col === "Resolved?";
                            return (
                              <div
                                key={colIdx}
                                className={`text-xs font-bold text-slate-500 ${
                                  isCheckbox ? "w-[100px] text-center" : "w-[180px] text-left"
                                }`}
                              >
                                {col}
                              </div>
                            );
                          })}
                          <div className="w-8" />
                        </div>

                        {/* Table Rows */}
                        {tableRows.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex items-center gap-2 mb-2">
                            <div className="w-[45px] h-8 flex items-center justify-center text-xs font-semibold text-slate-600 bg-slate-200/70 rounded-md shrink-0">
                              {rowIndex + 1}
                            </div>

                            {(item.columns || []).map((col, colIdx) => {
                              const isCheckbox = col === "Ticket Raised" || col === "Resolved?";
                              const isDate = col.toLowerCase().includes("date");
                              const cellKey = `col_${colIdx}`;
                              const cellVal = row[cellKey];

                              if (isCheckbox) {
                                return (
                                  <div key={colIdx} className="w-[100px] flex justify-center">
                                    <input
                                      type="checkbox"
                                      checked={!!cellVal}
                                      onChange={(e) => {
                                        updateTableCell(index, rowIndex, cellKey, e.target.checked);
                                      }}
                                      onBlur={handleAutoSave}
                                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </div>
                                );
                              }

                              if (isDate) {
                                return (
                                  <div key={colIdx} className="w-[180px]">
                                    <input
                                      type="date"
                                      value={cellVal || ""}
                                      onChange={(e) => {
                                        updateTableCell(index, rowIndex, cellKey, e.target.value);
                                      }}
                                      onBlur={handleAutoSave}
                                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div key={colIdx} className="w-[180px]">
                                  <textarea
                                    value={cellVal || ""}
                                    onChange={(e) => {
                                      updateTableCell(index, rowIndex, cellKey, e.target.value);
                                    }}
                                    onBlur={handleAutoSave}
                                    placeholder={col}
                                    rows={1}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm resize-none"
                                  />
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => removeTableRow(index, rowIndex)}
                              className="w-8 h-8 flex items-center justify-center text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Remove row"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addTableRow(index)}
                          className="w-full mt-2 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-dashed border-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          + Add Row
                        </button>
                      </div>
                    </div>
                  )}

                  {item.allowFileUpload && (
                    <FileUploadField
                      files={reportItem.files || []}
                      onChange={(updatedFiles) => {
                        updateReportItem(index, { files: updatedFiles });
                        handleAutoSave();
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Form Selection Handlers ──────────────────────────────────────────────────
  const handleSelectAllSection = (type, completedItems) => {
    const currentSelected = selectedItems[type] || [];
    const isAllSelected =
      completedItems.length > 0 &&
      completedItems.every((item) =>
        currentSelected.some((s) => s._id === item._id)
      );

    if (isAllSelected) {
      const completedIds = new Set(completedItems.map((i) => i._id));
      setSelectedItems((prev) => ({
        ...prev,
        [type]: (prev[type] || []).filter((i) => !completedIds.has(i._id)),
      }));
    } else {
      const existingIds = new Set(currentSelected.map((i) => i._id));
      const toAdd = completedItems.filter((i) => !existingIds.has(i._id));
      setSelectedItems((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), ...toAdd],
      }));
    }
  };

  const handleSelectAllGlobal = (allCompletedBySection) => {
    let totalAvailable = 0;
    let totalSelected = 0;

    Object.keys(allCompletedBySection).forEach((key) => {
      const items = allCompletedBySection[key] || [];
      totalAvailable += items.length;
      const currentSelected = selectedItems[key] || [];
      totalSelected += items.filter((item) =>
        currentSelected.some((s) => s._id === item._id)
      ).length;
    });

    const isAllGlobalSelected =
      totalAvailable > 0 && totalSelected === totalAvailable;

    if (isAllGlobalSelected) {
      setSelectedItems({
        form1: [],
        form2: [],
        form3: [],
        form4: [],
        form5: [],
      });
    } else {
      const newSelected = {};
      Object.keys(allCompletedBySection).forEach((key) => {
        const items = allCompletedBySection[key] || [];
        const currentSelected = selectedItems[key] || [];
        const existingIds = new Set(currentSelected.map((i) => i._id));
        const toAdd = items.filter((i) => !existingIds.has(i._id));
        newSelected[key] = [...currentSelected, ...toAdd];
      });
      setSelectedItems(newSelected);
    }
  };

  const renderFormCard = (item, type) => {
    const isChecked = selectedItems[type]?.some((i) => i._id === item._id);
    const teacherName =
      type === "form1"
        ? item?.teacherID?.name || item?.userId?.name
        : type === "form2"
          ? item?.grenralDetails?.NameoftheVisitingTeacher?.name ||
            item?.createdBy?.name
          : type === "form3"
            ? item?.teacherID?.name || item?.createdBy?.name
            : type === "form5"
              ? item?.grenralDetails?.NameoftheVisitingTeacher?.name || item?.createdBy?.name
              : item?.teacherId?.name || item?.userId?.name;

    const teacherPct =
      type === "form1"
        ? pct(
            getSelfScore(item, "teacherForm", "form1"),
            getTotalScore(item, "teacherForm", "form1"),
          )
        : type === "form2"
          ? pct(
              getSelfScore(item, "teacherForm", "form2"),
              getTotalScore(item, "teacherForm", "form2"),
            )
          : type === "form3"
            ? pct(
                getSelfScore(item, "TeacherForm", "form3"),
                getTotalScore(item, "TeacherForm", "form3"),
              )
            : null;

    const observerPct =
      type === "form1"
        ? pct(
            getSelfScore(item, "observerForm", "form1"),
            getTotalScore(item, "observerForm", "form1"),
          )
        : type === "form3"
          ? pct(
              getSelfScore(item, "ObserverForm", "form3"),
              getTotalScore(item, "ObserverForm", "form3"),
            )
          : type === "form5"
            ? item?.percentageScore
            : null;

    return (
      <Box
        key={item?._id}
        bg={isChecked ? "brand.background" : "white"}
        borderRadius="xl"
        borderWidth="2px"
        borderColor={isChecked ? "brand.primary" : "gray.100"}
        p={4}
        cursor="pointer"
        onClick={() => handleSelect(!isChecked, item, type)}
        transition="all 0.15s"
        _hover={{ borderColor: "brand.mid", boxShadow: "sm" }}
        boxShadow={isChecked ? "sm" : "none"}
      >
        <Flex align="flex-start" gap={3}>
          <Box pt="2px">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                handleSelect(e.target.checked, item, type);
              }}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </Box>
          <Box flex={1}>
            <Flex
              justify="space-between"
              align="flex-start"
              wrap="wrap"
              gap={2}
            >
              <Box>
                <Text fontSize="sm" fontWeight="600" color="brand.text">
                  {teacherName || "—"}
                </Text>
                <HStack spacing={3} mt={1}>
                  <Text fontSize="xs" color="gray.500">
                    {item?.className || item?.grenralDetails?.className || "—"}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    ·
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {
                      getAllTimes(
                        type === "form1" || type === "form4"
                          ? (item?.date || item?.createdAt)
                          : (item?.grenralDetails?.DateOfObservation || item?.createdAt)
                      )?.formattedDate2
                    }
                  </Text>
                </HStack>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                {teacherPct && <ScorePill label="Teacher" value={teacherPct} />}
                {observerPct && (
                  <ScorePill label="Observer" value={observerPct} />
                )}
                {type === "form2" && !teacherPct && (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">
                    No scores yet
                  </Text>
                )}
              </HStack>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  };

  const renderFormSelection = () => {
    const allCompletedBySection = {};
    let totalAvailableForms = 0;
    let totalSelectedForms = 0;

    if (getFilteredDataList) {
      (formData?.formTypes?.length > 0
        ? FORM_TITLES.filter((f) => formData.formTypes.includes(f.key))
        : FORM_TITLES
      ).forEach(({ key }) => {
        const items = getFilteredDataList?.[key] || [];
        const completed = items.filter((item) => {
          const isComp =
            (item?.isCoordinatorComplete && item?.isTeacherComplete) ||
            (item?.isObserverCompleted && item?.isTeacherCompletes) ||
            (item?.isTeacherComplete && item?.isObserverComplete) ||
            item?.isCompleted;

          if (!isComp) return false;

          if (formData?.observers && formData.observers.length > 0) {
            const possibleObserverIds = [];

            if (key === "form1") {
              if (item?.coordinatorID) possibleObserverIds.push(item?.coordinatorID?._id || item?.coordinatorID);
              if (item?.isObserverInitiation && item?.userId) possibleObserverIds.push(item?.userId?._id || item?.userId);
            } else if (key === "form2") {
              if (item?.createdBy) possibleObserverIds.push(item?.createdBy?._id || item?.createdBy);
            } else if (key === "form3") {
              if (item?.grenralDetails?.NameofObserver) possibleObserverIds.push(item?.grenralDetails?.NameofObserver?._id || item?.grenralDetails?.NameofObserver);
              if (item?.createdBy) possibleObserverIds.push(item?.createdBy?._id || item?.createdBy);
            } else if (key === "form4") {
              if (item?.isInitiated?.Observer) possibleObserverIds.push(item?.isInitiated?.Observer?._id || item?.isInitiated?.Observer);
              if (item?.coordinatorID) possibleObserverIds.push(item?.coordinatorID?._id || item?.coordinatorID);
            } else if (key === "form5") {
              if (item?.createdBy) possibleObserverIds.push(item?.createdBy?._id || item?.createdBy);
            }

            const obsIdStrs = possibleObserverIds.map((id) => id?.toString()).filter(Boolean);
            return obsIdStrs.some((idStr) => formData.observers.includes(idStr));
          }
          return true;
        });

        allCompletedBySection[key] = completed;
        totalAvailableForms += completed.length;

        const currentSelected = selectedItems[key] || [];
        totalSelectedForms += completed.filter((item) =>
          currentSelected.some((s) => s._id === item._id)
        ).length;
      });
    }

    const isAllGlobalSelected =
      totalAvailableForms > 0 && totalSelectedForms === totalAvailableForms;

    return (
      <Box>
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" color="brand.text" mb={1}>
              Form Selection
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Search for forms by date range and class, then select the ones to
              include.
            </Text>
          </Box>

          {totalAvailableForms > 0 && (
            <Button
              size="sm"
              colorScheme={isAllGlobalSelected ? "red" : "green"}
              variant={isAllGlobalSelected ? "outline" : "solid"}
              bg={isAllGlobalSelected ? "transparent" : "brand.primary"}
              color={isAllGlobalSelected ? "red.600" : "white"}
              _hover={{ bg: isAllGlobalSelected ? "red.50" : "brand.secondary" }}
              onClick={() => handleSelectAllGlobal(allCompletedBySection)}
            >
              {isAllGlobalSelected ? "Deselect All Forms" : `Select All Forms (${totalAvailableForms})`}
            </Button>
          )}
        </Flex>

        {/* Filter card */}
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.100"
          p={5}
          mb={6}
          boxShadow="sm"
        >
          <Text fontSize="sm" fontWeight="600" color="brand.text" mb={4}>
            Search Filters
          </Text>
          <Fillter_Wing saveData={setFormData} data={currForm} />
        </Box>

        {/* Form type sections */}
        {getFilteredDataList ? (
          <VStack spacing={6} align="stretch">
            {(formData?.formTypes?.length > 0
              ? FORM_TITLES.filter((f) => formData.formTypes.includes(f.key))
              : FORM_TITLES
            ).map(({ key, label, color }) => {
              const completed = allCompletedBySection[key] || [];
              const selected = selectedItems[key]?.length || 0;
              const isSectionAllSelected =
                completed.length > 0 &&
                completed.every((item) =>
                  (selectedItems[key] || []).some((s) => s._id === item._id)
                );

              return (
                <Box key={key}>
                  <Flex align="center" justify="space-between" mb={3}>
                    <HStack spacing={2}>
                      <Box w={2} h={5} borderRadius="full" bg={`${color}.400`} />
                      <Heading size="sm" color="brand.text">
                        {label}
                      </Heading>
                      <Badge colorScheme={color} variant="subtle" fontSize="xs">
                        {completed.length} available
                      </Badge>
                    </HStack>
                    <HStack spacing={2}>
                      {completed.length > 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme={isSectionAllSelected ? "red" : "green"}
                          borderColor={isSectionAllSelected ? "red.200" : "green.300"}
                          color={isSectionAllSelected ? "red.600" : "green.700"}
                          bg={isSectionAllSelected ? "red.50" : "green.50"}
                          _hover={{ bg: isSectionAllSelected ? "red.100" : "green.100" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAllSection(key, completed);
                          }}
                        >
                          {isSectionAllSelected ? "Deselect All" : `Select All (${completed.length})`}
                        </Button>
                      )}
                      {selected > 0 && (
                        <Badge
                          bg="brand.primary"
                          color="white"
                          borderRadius="full"
                          px={2}
                          fontSize="xs"
                        >
                          {selected} selected
                        </Badge>
                      )}
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.500"
                        _hover={{ borderColor: "brand.primary", color: "brand.primary", bg: "brand.background" }}
                        leftIcon={<ReloadOutlined spin={syncing[key]} />}
                        isLoading={syncing[key]}
                        loadingText="Syncing…"
                        onClick={(e) => { e.stopPropagation(); handleSync(key); }}
                        title="Re-fetch latest data for these reports"
                      >
                        Refresh
                      </Button>
                    </HStack>
                  </Flex>

                  {completed.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {completed.map((item) => renderFormCard(item, key))}
                    </VStack>
                  ) : (
                    <Box
                      bg="gray.50"
                      borderRadius="lg"
                      p={4}
                      textAlign="center"
                      borderWidth="1px"
                      borderColor="gray.100"
                      borderStyle="dashed"
                    >
                      <Text fontSize="sm" color="gray.400">
                        No completed forms found for the selected filter.
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        ) : (
          <Box
            bg="gray.50"
            borderRadius="xl"
            p={10}
            textAlign="center"
            borderWidth="1px"
            borderColor="gray.100"
            borderStyle="dashed"
          >
            <FileTextOutlined
              style={{ fontSize: 32, color: "#CBD5E0", marginBottom: 12 }}
            />
            <Text color="gray.400" fontSize="sm">
              Apply a date range and class filter above to load available forms.
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  // ── Review & Publish Section ────────────────────────────────────────────────
  const renderReview = () => (
    <Box>
      <Box mb={6}>
        <Heading size="md" color="brand.text" mb={1}>
          Review & Publish
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Review your selections and monthly report before publishing.
        </Text>
      </Box>
      <VStack spacing={5} align="stretch">
        {/* Selected forms summary */}
        {FORM_TITLES.map(({ key, label, color }) => {
          const count = selectedItems[key]?.length || 0;
          return (
            <Box
              key={key}
              bg="white"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={count > 0 ? "brand.primary" : "gray.100"}
              p={4}
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Box w={2} h={5} borderRadius="full" bg={`${color}.400`} />
                  <Text fontWeight="600" fontSize="sm" color="brand.text">
                    {label}
                  </Text>
                </HStack>
                <Badge
                  colorScheme={count > 0 ? "green" : "gray"}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                >
                  {count} selected
                </Badge>
              </Flex>
            </Box>
          );
        })}
        {/* Monthly report summary */}
        <Box
          bg="brand.background"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="brand.mid"
          p={5}
          boxShadow="sm"
        >
          <Text fontWeight="600" fontSize="sm" color="brand.text" mb={3}>
            Monthly Report
          </Text>
          <VStack spacing={2} align="stretch">
            {(monthlyReport || []).map((item, i) =>
              item?.question ? (
                <Box key={i}>
                  <Text fontSize="xs" color="gray.500" fontWeight="500">
                    {item.question}
                  </Text>

                  {inputsWing[i]?.type === "text" ? (
                    <Text
                      fontSize="sm"
                      color="brand.text"
                    >
                      {item.answer || (
                        <Text as="span" color="gray.400" fontStyle="italic">
                          No answer
                        </Text>
                      )}
                    </Text>
                  ) : (
                    <div className="mt-2 overflow-x-auto">
                      {item.tableData?.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-slate-500 w-12">
                                S.No.
                              </th>
                              {(inputsWing[i]?.columns || []).map((col, cIdx) => (
                                <th
                                  key={cIdx}
                                  className="px-3 py-2 text-left font-semibold text-slate-500"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {item.tableData.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 text-slate-500 font-medium">
                                  {rIdx + 1}
                                </td>
                                {(inputsWing[i]?.columns || []).map((col, cIdx) => {
                                  const val = row[`col_${cIdx}`];
                                  return (
                                    <td key={cIdx} className="px-3 py-2 text-slate-700">
                                      {typeof val === "boolean"
                                        ? val
                                          ? "✔️"
                                          : "—"
                                        : val || "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <span className="text-slate-400 italic text-sm">No table data</span>
                      )}
                    </div>
                  )}
                </Box>
              ) : null,
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {/* ── Page Header ── */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="lg" color="brand.text" mb={1}>
            Monthly Report - Wing Coordinator
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Complete the monthly report, then link the relevant forms.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SyncOutlined spin={syncingAll} />}
            borderColor="gray.200"
            color="gray.500"
            _hover={{ borderColor: "brand.primary", color: "brand.primary", bg: "brand.background" }}
            isLoading={syncingAll}
            loadingText="Syncing…"
            onClick={handleSyncAll}
            title="Sync all stored report data with the latest changes"
          >
            Sync All
          </Button>
          {lastSavedTime && (
            <HStack spacing={1.5} px={3} py={1} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="full">
              <Box as="span" w={2} h={2} borderRadius="full" bg="green.500" />
              <Text fontSize="xs" fontWeight="500" color="green.700">
                Draft Auto-Saved
              </Text>
            </HStack>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SaveOutlined />}
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{ bg: "brand.background" }}
            isLoading={saving}
            onClick={handleSave}
          >
            Save Draft
          </Button>
        </HStack>
      </Flex>

      {/* ── Progress bar ── */}
      <Progress
        value={currStep === 1 ? 33 : currStep === 2 ? 66 : 100}
        size="xs"
        colorScheme="green"
        borderRadius="full"
        mb={6}
        bg="gray.100"
      />

      {/* ── Step Indicator ── */}
      <StepIndicator current={currStep} />

      {/* ── Loading overlay ── */}
      {loading && (
        <Flex justify="center" align="center" py={12}>
          <Spinner size="xl" color="brand.primary" thickness="3px" />
        </Flex>
      )}

      {/* ── Main Content Card ── */}
      <Box
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.100"
        boxShadow="sm"
        p={{ base: 5, md: 8 }}
        display={loading ? "none" : "block"}
      >
        <Box display={currStep === 1 ? "block" : "none"}>
          {renderMonthlyReport()}
        </Box>
        <Box display={currStep === 2 ? "block" : "none"}>
          {renderFormSelection()}
        </Box>
        <Box display={currStep === 3 ? "block" : "none"}>
          {renderReview()}
        </Box>
      </Box>

      {/* ── Action Footer ── */}
      <Flex
        justify="space-between"
        align="center"
        mt={6}
        pt={4}
        borderTopWidth="1px"
        borderColor="gray.100"
        display={loading ? "none" : "flex"}
      >
        <Button
          variant="ghost"
          size="md"
          color="gray.500"
          _hover={{ color: "brand.text", bg: "gray.50" }}
          onClick={() => {
            handleAutoSave();
            handleSave(true); // Auto-save draft silently
            navigate("/wing-coordinator");
          }}
        >
          ← Back to List
        </Button>

        <HStack spacing={3}>
          {/* Previous button */}
          {currStep > 1 && (
            <Button
              variant="outline"
              size="md"
              borderColor="gray.200"
              color="gray.600"
              _hover={{ bg: "gray.50" }}
              leftIcon={<ArrowLeftOutlined />}
              onClick={() => {
                handleAutoSave();
                setCurrStep((s) => s - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Previous
            </Button>
          )}

          {/* Step 1 → 2 */}
          {currStep === 1 && (
            <Button
              size="md"
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              rightIcon={<ArrowRightOutlined />}
              onClick={() => {
                if (validateStepOne()) {
                  handleAutoSave();
                  handleSave(true); // Auto-save when moving to next step
                  setCurrStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              transition="all 0.15s"
            >
              Next: Form Selection
            </Button>
          )}

          {/* Step 2 → 3 */}
          {currStep === 2 && (
            <Button
              size="md"
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              rightIcon={<ArrowRightOutlined />}
              onClick={() => {
                handleAutoSave();
                handleSave(true);
                setCurrStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              transition="all 0.15s"
            >
              Next: Review & Publish
            </Button>
          )}

          {/* Step 3 — Publish */}
          {currStep === 3 && (
            <Button
              size="md"
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              rightIcon={<SendOutlined />}
              isLoading={publishing}
              loadingText="Publishing…"
              onClick={handlePublish}
              transition="all 0.15s"
            >
              Publish Form
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

export default OB_Wing;
