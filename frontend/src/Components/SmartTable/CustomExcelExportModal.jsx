import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  Icon,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
} from "@chakra-ui/react";
import {
  Download,
  Check,
  Sparkles,
  Search,
  FileSpreadsheet,
  BookmarkCheck,
  CheckCheck,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";

// ── Score calculation for Form 3 (Notebook Checking) ─────────────────────────
export const calculateNotebookScore = (formName) => {
  let totalScore = 0;
  let outOfScore = 0;
  const keys = [
    "maintenanceOfNotebooks",
    "qualityOfOppurtunities",
    "qualityOfTeacherFeedback",
    "qualityOfLearner",
  ];
  keys.forEach((section) => {
    if (formName?.[section] && Array.isArray(formName[section])) {
      formName[section].forEach((item) => {
        const ans = item?.answer;
        if (["1", "2", "3"].includes(ans)) {
          totalScore += parseInt(ans, 10);
          outOfScore += 3;
        }
      });
    }
  });
  return { totalScore, outOfScore };
};

// ── Helper to recursively extract plain text from React nodes ───────────────
const extractTextFromReactNode = (node) => {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node
      .map(extractTextFromReactNode)
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  if (React.isValidElement(node)) {
    // If it's a Badge or Status component with value prop
    if (node.props?.value !== undefined && typeof node.props.value === "boolean") {
      return node.props.value
        ? node.props.trueLabel || "Completed"
        : node.props.falseLabel || "Pending";
    }
    // If UserCell or component with name prop
    if (node.props?.name) {
      return String(node.props.name);
    }
    return extractTextFromReactNode(node.props?.children);
  }
  return "";
};

// ── Helper to format date cleanly ────────────────────────────────────────────
const formatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const CustomExcelExportModal = ({
  isOpen,
  onClose,
  data = [],
  columns = [],
  downloadFileName = "report",
  tableTitle = "",
  isCuteActive = false,
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Clean table title for dynamic branding
  const cleanTitle = useMemo(() => {
    if (tableTitle) {
      return tableTitle.split("—")[0].split("-")[0].replace(/Proforma|Report|All Records/gi, "").trim() || tableTitle.replace(/—.*$/g, "").trim();
    }
    if (downloadFileName) {
      return downloadFileName
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return "Table";
  }, [tableTitle, downloadFileName]);

  // Unique storage key for THIS specific table
  const storageKey = useMemo(() => {
    const rawKey = (tableTitle || downloadFileName || "table")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    return `custom_excel_pref_${rawKey}`;
  }, [tableTitle, downloadFileName]);

  // Sample record for live preview
  const sampleRecord = useMemo(() => (data && data.length > 0 ? data[0] : null), [data]);

  // ── DYNAMIC FIELD EXTRACTION BASED ON ACTIVE TABLE ─────────────────────────
  const availableFields = useMemo(() => {
    const fields = [];
    const addedIds = new Set();

    const addField = (fieldObj) => {
      if (!addedIds.has(fieldObj.id)) {
        addedIds.add(fieldObj.id);
        fields.push(fieldObj);
      }
    };

    const getFormattedValue = (col, record) => {
      if (!record) return "—";
      const rawVal = col.dataIndex ? record[col.dataIndex] : record[col.key];

      if (
        rawVal &&
        typeof rawVal === "object" &&
        !Array.isArray(rawVal) &&
        !(rawVal instanceof Date)
      ) {
        if (rawVal.name) return rawVal.name;
        if (rawVal.className) return rawVal.className;
        if (rawVal.title) return rawVal.title;
      }

      if (typeof rawVal === "boolean") {
        return rawVal ? "Completed" : "Pending";
      }

      if (typeof col.render === "function") {
        try {
          const rendered = col.render(rawVal, record);
          const text = extractTextFromReactNode(rendered);
          if (text !== undefined && text !== null && text !== "") {
            return text;
          }
        } catch (e) {
          // ignore
        }
      }

      if (rawVal instanceof Date) return formatDate(rawVal);
      if (
        typeof rawVal === "string" &&
        (col.key?.toLowerCase().includes("date") ||
          col.title?.toLowerCase().includes("date"))
      ) {
        return formatDate(rawVal);
      }

      if (rawVal === null || rawVal === undefined) return "—";
      if (typeof rawVal === "object") {
        if (Array.isArray(rawVal)) {
          return rawVal
            .map((v) => (typeof v === "object" ? v?.name || JSON.stringify(v) : v))
            .join(", ");
        }
        return JSON.stringify(rawVal);
      }

      return String(rawVal);
    };

    // Parse all table columns
    columns.forEach((col) => {
      if (!col.key && !col.title) return;
      if (col.key === "action" || col.dataIndex === "action") return;

      const titleLower = (col.title || "").toLowerCase();
      const keyLower = (col.key || "").toLowerCase();
      const isScoreCol = titleLower.includes("score") || keyLower.includes("score");

      let category = "General Details";
      if (isScoreCol) {
        category = "Scores & Evaluation";
      } else if (
        titleLower.includes("status") ||
        titleLower.includes("complete") ||
        keyLower.includes("status") ||
        keyLower.includes("complete")
      ) {
        category = "Status & Workflow";
      } else if (titleLower.includes("date") || keyLower.includes("date")) {
        category = "Timeline & Dates";
      } else if (
        titleLower.includes("observer") ||
        titleLower.includes("teacher") ||
        titleLower.includes("user") ||
        titleLower.includes("role") ||
        titleLower.includes("email") ||
        titleLower.includes("mobile") ||
        titleLower.includes("designation")
      ) {
        category = "People & Roles";
      } else if (
        titleLower.includes("comment") ||
        titleLower.includes("remark") ||
        titleLower.includes("feedback") ||
        titleLower.includes("reflection")
      ) {
        category = "Comments & Feedback";
      }

      if (isScoreCol) {
        // 1. Obtained Score
        addField({
          id: `${col.key || col.title}_score`,
          label: `${col.title || "Score"}`,
          category: "Scores & Evaluation",
          isScore: true,
          scoreType: "obtained",
          typeBadge: "Score",
          badgeColor: "teal",
          getValue: (r) => {
            if (keyLower.includes("teacher") && r?.TeacherForm) {
              return calculateNotebookScore(r.TeacherForm).totalScore;
            }
            if (keyLower.includes("observer") && r?.ObserverForm) {
              return calculateNotebookScore(r.ObserverForm).totalScore;
            }
            if (keyLower.includes("teacher") && r?.teacherScore !== undefined && r?.teacherScore !== null) {
              return r.teacherScore;
            }
            if (keyLower.includes("observer") && r?.observerScore !== undefined && r?.observerScore !== null) {
              return r.observerScore;
            }
            if (r?.totalScores !== undefined && r?.totalScores !== null) {
              return r.totalScores;
            }
            const str = getFormattedValue(col, r);
            if (str && str.includes("/")) {
              return str.split("/")[0].trim();
            }
            return str !== "—" ? str : "N/A";
          },
        });

        // 2. Out of Score
        addField({
          id: `${col.key || col.title}_outOfScore`,
          label: `${col.title || "Score"} (Out Of)`,
          category: "Scores & Evaluation",
          isScore: true,
          scoreType: "outOf",
          typeBadge: "Max Out Of",
          badgeColor: "purple",
          getValue: (r) => {
            if (keyLower.includes("teacher") && r?.TeacherForm) {
              return calculateNotebookScore(r.TeacherForm).outOfScore;
            }
            if (keyLower.includes("observer") && r?.ObserverForm) {
              return calculateNotebookScore(r.ObserverForm).outOfScore;
            }
            if (keyLower.includes("teacher") && r?.teacherTotal !== undefined && r?.teacherTotal !== null) {
              return r.teacherTotal;
            }
            if (keyLower.includes("observer") && r?.observerTotal !== undefined && r?.observerTotal !== null) {
              return r.observerTotal;
            }
            if (r?.scoreOutof !== undefined && r?.scoreOutof !== null) {
              return r.scoreOutof;
            }
            const str = getFormattedValue(col, r);
            if (str && str.includes("/")) {
              return str.split("/")[1].trim();
            }
            return "N/A";
          },
        });

        // 3. Percentage
        addField({
          id: `${col.key || col.title}_percentage`,
          label: `${col.title || "Score"} (%)`,
          category: "Scores & Evaluation",
          isScore: true,
          scoreType: "percentage",
          typeBadge: "% Formula",
          badgeColor: "blue",
          getValue: (r) => {
            let sc = 0;
            let out = 0;
            if (keyLower.includes("teacher") && r?.TeacherForm) {
              const res = calculateNotebookScore(r.TeacherForm);
              sc = res.totalScore;
              out = res.outOfScore;
            } else if (keyLower.includes("observer") && r?.ObserverForm) {
              const res = calculateNotebookScore(r.ObserverForm);
              sc = res.totalScore;
              out = res.outOfScore;
            } else if (keyLower.includes("teacher") && r?.teacherScore !== undefined && r?.teacherTotal) {
              sc = Number(r.teacherScore);
              out = Number(r.teacherTotal);
            } else if (keyLower.includes("observer") && r?.observerScore !== undefined && r?.observerTotal) {
              sc = Number(r.observerScore);
              out = Number(r.observerTotal);
            } else if (r?.totalScores !== undefined && r?.scoreOutof) {
              sc = Number(r.totalScores);
              out = Number(r.scoreOutof);
            } else {
              const str = getFormattedValue(col, r);
              if (str && str.includes("/")) {
                const parts = str.split("/");
                sc = parseFloat(parts[0]);
                out = parseFloat(parts[1]);
              }
            }
            if (out > 0 && !isNaN(sc) && !isNaN(out)) {
              return `${((sc / out) * 100).toFixed(1)}%`;
            }
            return "N/A";
          },
        });
      } else {
        let typeBadge = "Field";
        if (category === "Status & Workflow") typeBadge = "Status";
        if (category === "Timeline & Dates") typeBadge = "Date";
        if (category === "Comments & Feedback") typeBadge = "Text";

        addField({
          id: col.key || col.dataIndex || col.title,
          label: col.title || col.key,
          category,
          typeBadge,
          getValue: (r) => getFormattedValue(col, r),
        });
      }
    });

    // Check sample record for additional remarks/comments
    const sample = data?.[0] || {};
    if (
      (sample.observerComment || sample?.ObserverForm?.comment || sample.notebookComment) &&
      !addedIds.has("observerComment")
    ) {
      addField({
        id: "observerComment",
        label: "Observer Comment / Feedback",
        category: "Comments & Feedback",
        typeBadge: "Text",
        getValue: (r) =>
          r?.observerComment ||
          r?.ObserverForm?.comment ||
          r?.notebookComment ||
          "—",
      });
    }

    if (
      (sample?.TeacherForm?.reflection || sample.reflectionFeedback || sample.reflection) &&
      !addedIds.has("reflectionFeedback")
    ) {
      addField({
        id: "reflectionFeedback",
        label: "Teacher Reflection Remarks",
        category: "Comments & Feedback",
        typeBadge: "Text",
        getValue: (r) =>
          r?.TeacherForm?.reflection ||
          r?.reflectionFeedback ||
          r?.reflection ||
          "—",
      });
    }

    return fields;
  }, [columns, data]);

  // ── Selected Field IDs ─────────────────────────────────────────────────────
  const [selectedFields, setSelectedFields] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return availableFields
      .filter((f) => f.scoreType !== "percentage")
      .map((f) => f.id);
  });

  // ── Save Preference Boolean ────────────────────────────────────────────────
  const [savePreferences, setSavePreferences] = useState(() => {
    try {
      return localStorage.getItem(`${storageKey}_save_enabled`) !== "false";
    } catch (e) {
      return true;
    }
  });

  // Load preferences when modal opens or table changes
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedFields(parsed);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      setSelectedFields(
        availableFields
          .filter((f) => f.scoreType !== "percentage")
          .map((f) => f.id)
      );
    }
  }, [isOpen, storageKey, availableFields]);

  // Handle preference toggle
  const handleSavePrefToggle = (val) => {
    setSavePreferences(val);
    try {
      localStorage.setItem(`${storageKey}_save_enabled`, String(val));
      if (val) {
        localStorage.setItem(storageKey, JSON.stringify(selectedFields));
      }
    } catch (err) {
      // ignore
    }
  };

  // Toggle individual field
  const toggleField = (id) => {
    setSelectedFields((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      if (savePreferences) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  };

  // Bulk selectors
  const selectAll = () => {
    const allIds = availableFields.map((f) => f.id);
    setSelectedFields(allIds);
    if (savePreferences) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(allIds));
      } catch (e) {
        // ignore
      }
    }
  };

  const clearAll = () => {
    setSelectedFields([]);
    if (savePreferences) {
      try {
        localStorage.setItem(storageKey, JSON.stringify([]));
      } catch (e) {
        // ignore
      }
    }
  };

  const resetToDefault = () => {
    const defaultIds = availableFields
      .filter((f) => f.scoreType !== "percentage")
      .map((f) => f.id);
    setSelectedFields(defaultIds);
    if (savePreferences) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(defaultIds));
      } catch (e) {
        // ignore
      }
    }
  };

  // Search filter
  const filteredFields = useMemo(() => {
    if (!searchTerm.trim()) return availableFields;
    const lower = searchTerm.toLowerCase();
    return availableFields.filter(
      (f) =>
        f.label.toLowerCase().includes(lower) ||
        f.category.toLowerCase().includes(lower)
    );
  }, [availableFields, searchTerm]);

  // Group by category
  const groupedFields = useMemo(() => {
    const map = {};
    filteredFields.forEach((f) => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [filteredFields]);

  // ── Excel Export Handler ───────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (selectedFields.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please check at least one column to export.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (!data || data.length === 0) {
      toast({
        title: "No records found",
        description: "There are no data rows to download in this table.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (savePreferences) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(selectedFields));
        localStorage.setItem(`${storageKey}_save_enabled`, "true");
      } catch (e) {
        // ignore
      }
    }

    const selectedFieldsList = availableFields.filter((f) =>
      selectedFields.includes(f.id)
    );

    const exportRows = data.map((record) => {
      const row = {};
      selectedFieldsList.forEach((field) => {
        row[field.label] = field.getValue(record);
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);

    const headers = selectedFieldsList.map((f) => f.label);
    const colWidths = headers.map((header) => {
      const maxLen = Math.max(
        String(header).length,
        ...exportRows.map((row) => String(row[header] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 3, 12), 48) };
    });
    ws["!cols"] = colWidths;

    const sheetName = isCuteActive ? "Malkin's Special" : cleanTitle.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const prefix = isCuteActive ? "nishas_special" : "custom_export";
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${downloadFileName}_${prefix}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);

    toast({
      title: isCuteActive
        ? "Malkin's Special Excel downloaded! 🌸✨"
        : `${cleanTitle} Excel exported!`,
      description: `Successfully exported ${exportRows.length} record(s) with ${selectedFieldsList.length} customized column(s).`,
      status: "success",
      duration: 3500,
      isClosable: true,
    });

    onClose();
  }, [
    selectedFields,
    data,
    savePreferences,
    storageKey,
    availableFields,
    isCuteActive,
    cleanTitle,
    downloadFileName,
    toast,
    onClose,
  ]);

  // Brand Palette Accents
  const brandAccent = isCuteActive ? "#db2777" : "#1a4d2e";
  const brandSoftBg = isCuteActive ? "#fff0f5" : "#f4f8f4";
  const brandBorder = isCuteActive ? "#fbcfe8" : "#cce0cd";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
      <ModalContent
        borderRadius="24px"
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="1px solid"
        borderColor={isCuteActive ? "pink.200" : "gray.200"}
        maxW={{ base: "95vw", md: "680px" }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <ModalHeader
          p={0}
          borderBottom="1px solid"
          borderColor={isCuteActive ? "pink.100" : "gray.100"}
          bg={
            isCuteActive
              ? "linear-gradient(135deg, #fff5f8 0%, #fdf2f8 100%)"
              : "white"
          }
        >
          <Box px={6} pt={5} pb={4}>
            <Flex align="center" justify="space-between">
              <HStack spacing={3}>
                <Box
                  w="42px"
                  h="42px"
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={brandSoftBg}
                  color={brandAccent}
                  border="1.5px solid"
                  borderColor={brandBorder}
                  boxShadow="xs"
                >
                  <Icon
                    as={isCuteActive ? Sparkles : FileSpreadsheet}
                    boxSize="20px"
                  />
                </Box>
                <Box>
                  <HStack spacing={2} align="center">
                    <Text
                      fontSize="md"
                      fontWeight="700"
                      color="gray.900"
                      letterSpacing="-0.01em"
                    >
                      {isCuteActive
                        ? `Malkin's Special — ${cleanTitle} 🌸`
                        : `Export Customizer — ${cleanTitle}`}
                    </Text>
                    {isCuteActive && (
                      <Badge
                        colorScheme="pink"
                        rounded="full"
                        px={2.5}
                        py={0.5}
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="0.02em"
                      >
                        SoftGirl CEO 💕
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Select columns and separated score fields to download in your spreadsheet.
                  </Text>
                </Box>
              </HStack>
              <ModalCloseButton
                position="static"
                rounded="lg"
                color="gray.400"
                _hover={{ bg: "gray.100", color: "gray.700" }}
              />
            </Flex>
          </Box>
        </ModalHeader>

        {/* ── BODY ────────────────────────────────────────────────────────── */}
        <ModalBody p={6} bg="white">
          {/* Quick Toolbar: Search & Batch Controls */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
            justify="space-between"
            gap={3}
            mb={5}
          >
            {/* Search Input */}
            <InputGroup size="sm" maxW={{ base: "100%", sm: "240px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={Search} color="gray.400" boxSize="13px" />
              </InputLeftElement>
              <Input
                placeholder="Filter columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="lg"
                fontSize="xs"
                bg="gray.50/80"
                border="1px solid"
                borderColor="gray.200"
                _focus={{
                  bg: "white",
                  borderColor: brandAccent,
                  boxShadow: `0 0 0 1px ${brandAccent}`,
                }}
              />
            </InputGroup>

            {/* Selection Presets */}
            <HStack spacing={1.5} wrap="wrap">
              <Button
                size="xs"
                variant="outline"
                leftIcon={<Icon as={CheckCheck} boxSize="12px" />}
                onClick={selectAll}
                borderRadius="md"
                color="gray.700"
                borderColor="gray.200"
                fontSize="11px"
                fontWeight="500"
              >
                All
              </Button>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<Icon as={RotateCcw} boxSize="11px" />}
                onClick={resetToDefault}
                borderRadius="md"
                color="gray.700"
                borderColor="gray.200"
                fontSize="11px"
                fontWeight="500"
              >
                Default
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={clearAll}
                borderRadius="md"
                color="gray.500"
                fontSize="11px"
                fontWeight="500"
              >
                Clear
              </Button>
              <Badge
                colorScheme={selectedFields.length > 0 ? (isCuteActive ? "pink" : "green") : "gray"}
                borderRadius="md"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="600"
              >
                {selectedFields.length} / {availableFields.length} active
              </Badge>
            </HStack>
          </Flex>

          {/* Grouped Field Columns */}
          <VStack spacing={4} align="stretch" maxH="380px" overflowY="auto" pr={1}>
            {Object.entries(groupedFields).map(([category, catFields]) => (
              <Box key={category}>
                {/* Clean section header */}
                <Flex align="center" justify="space-between" mb={2} px={1}>
                  <HStack spacing={2} align="center">
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="gray.700"
                      letterSpacing="0.01em"
                    >
                      {category}
                    </Text>
                    {category === "Scores & Evaluation" && (
                      <Badge
                        colorScheme={isCuteActive ? "pink" : "teal"}
                        fontSize="9px"
                        borderRadius="full"
                        px={1.5}
                      >
                        Separated Columns
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="10px" color="gray.400" fontWeight="500">
                    {catFields.filter((f) => selectedFields.includes(f.id)).length} of {catFields.length} selected
                  </Text>
                </Flex>

                {/* Cards Grid */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                  {catFields.map((field) => {
                    const isChecked = selectedFields.includes(field.id);
                    // Extract live sample preview from first record
                    const sampleVal = sampleRecord ? field.getValue(sampleRecord) : null;
                    const previewText = sampleVal !== null && sampleVal !== undefined && sampleVal !== "" ? String(sampleVal) : null;

                    return (
                      <Box
                        key={field.id}
                        p={2.5}
                        rounded="xl"
                        border="1.5px solid"
                        borderColor={
                          isChecked
                            ? isCuteActive
                              ? "pink.400"
                              : "#1a4d2e"
                            : "gray.200"
                        }
                        bg={
                          isChecked
                            ? isCuteActive
                              ? "#fff5f8"
                              : "#f4f8f4"
                            : "white"
                        }
                        cursor="pointer"
                        transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
                        _hover={{
                          borderColor: isChecked
                            ? isCuteActive
                              ? "pink.500"
                              : "#1a4d2e"
                            : "gray.300",
                          transform: "translateY(-1px)",
                          boxShadow: "xs",
                        }}
                        onClick={() => toggleField(field.id)}
                        role="checkbox"
                        aria-checked={isChecked}
                      >
                        <Flex align="flex-start" justify="space-between" gap={2}>
                          {/* Left: Custom Checkbox Icon + Labels */}
                          <Flex align="flex-start" gap={2.5} flex={1} overflow="hidden">
                            {/* Checkmark square */}
                            <Box
                              w="18px"
                              h="18px"
                              rounded="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              bg={
                                isChecked
                                  ? isCuteActive
                                    ? "pink.500"
                                    : "#1a4d2e"
                                  : "white"
                              }
                              border="1.5px solid"
                              borderColor={
                                isChecked
                                  ? isCuteActive
                                    ? "pink.500"
                                    : "#1a4d2e"
                                  : "gray.300"
                              }
                              color="white"
                              transition="all 0.15s ease"
                              flexShrink={0}
                              mt="1px"
                            >
                              {isChecked && (
                                <Icon as={Check} boxSize="12px" strokeWidth={3.5} />
                              )}
                            </Box>

                            {/* Column Name & Preview */}
                            <Box flex={1} overflow="hidden">
                              <Text
                                fontSize="xs"
                                fontWeight={isChecked ? "600" : "500"}
                                color={isChecked ? "gray.900" : "gray.700"}
                                lineHeight="shorter"
                                isTruncated
                              >
                                {field.label}
                              </Text>

                              {/* Live Data Sample Preview */}
                              {previewText && (
                                <Text
                                  fontSize="10px"
                                  color={isChecked ? (isCuteActive ? "pink.700" : "#1a4d2e") : "gray.400"}
                                  mt={0.5}
                                  isTruncated
                                >
                                  e.g. {previewText}
                                </Text>
                              )}
                            </Box>
                          </Flex>

                          {/* Right: Field Type Badge */}
                          {field.typeBadge && (
                            <Badge
                              variant="subtle"
                              colorScheme={field.badgeColor || (field.isScore ? "purple" : "gray")}
                              fontSize="9px"
                              fontWeight="600"
                              px={1.5}
                              py={0.5}
                              rounded="md"
                              flexShrink={0}
                            >
                              {field.typeBadge}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))}

            {filteredFields.length === 0 && (
              <Box py={8} textAlign="center" color="gray.400">
                <Text fontSize="xs">No columns matching "{searchTerm}"</Text>
              </Box>
            )}
          </VStack>

          {/* ── PROMINENT PREFERENCE CALLOUT CARD ──────────────────────────── */}
          <Box
            mt={4}
            p={3.5}
            rounded="xl"
            border="1.5px solid"
            borderColor={
              savePreferences
                ? isCuteActive
                  ? "pink.300"
                  : "#cce0cd"
                : "gray.200"
            }
            bg={
              savePreferences
                ? isCuteActive
                  ? "#fff0f5"
                  : "#f4f8f4"
                : "gray.50/80"
            }
            cursor="pointer"
            transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            onClick={() => handleSavePrefToggle(!savePreferences)}
            _hover={{
              borderColor: isCuteActive ? "pink.400" : "#1a4d2e",
              boxShadow: "xs",
            }}
          >
            <Flex align="center" justify="space-between" gap={3}>
              <Flex align="center" gap={3}>
                {/* Checkbox box indicator */}
                <Box
                  w="20px"
                  h="20px"
                  rounded="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={
                    savePreferences
                      ? isCuteActive
                        ? "pink.500"
                        : "#1a4d2e"
                      : "white"
                  }
                  border="2px solid"
                  borderColor={
                    savePreferences
                      ? isCuteActive
                        ? "pink.500"
                        : "#1a4d2e"
                      : "gray.300"
                  }
                  color="white"
                  transition="all 0.15s ease"
                  flexShrink={0}
                >
                  {savePreferences && (
                    <Icon as={Check} boxSize="13px" strokeWidth={3.5} />
                  )}
                </Box>

                <Box>
                  <HStack spacing={2} align="center">
                    <Icon
                      as={BookmarkCheck}
                      boxSize="15px"
                      color={savePreferences ? brandAccent : "gray.400"}
                    />
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color={savePreferences ? "gray.900" : "gray.700"}
                    >
                      Save my chosen columns as default for {cleanTitle}
                    </Text>
                    {savePreferences && (
                      <Badge
                        colorScheme={isCuteActive ? "pink" : "green"}
                        fontSize="9px"
                        rounded="full"
                        px={1.5}
                      >
                        Auto-remembered ✨
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="10px" color="gray.500" mt={0.5}>
                    Your selection will be pre-filled automatically next time you export {cleanTitle}.
                  </Text>
                </Box>
              </Flex>

              <Badge
                variant={savePreferences ? "solid" : "outline"}
                colorScheme={isCuteActive ? "pink" : "green"}
                fontSize="10px"
                px={2}
                py={0.5}
                rounded="md"
                flexShrink={0}
              >
                {savePreferences ? "Enabled" : "Off"}
              </Badge>
            </Flex>
          </Box>
        </ModalBody>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <ModalFooter
          bg={isCuteActive ? "#fdf2f8" : "gray.50"}
          borderTop="1px solid"
          borderColor={isCuteActive ? "pink.100" : "gray.100"}
          py={3.5}
          px={6}
        >
          <Flex align="center" justify="space-between" w="full">
            {/* Left summary counter */}
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {data.length} row{data.length !== 1 ? "s" : ""} •{" "}
              <strong style={{ color: "#111827" }}>
                {selectedFields.length} column{selectedFields.length !== 1 ? "s" : ""}
              </strong>{" "}
              selected
            </Text>

            {/* Right Buttons */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="500"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                leftIcon={<Icon as={Download} boxSize="14px" />}
                colorScheme={isCuteActive ? "pink" : "green"}
                bg={
                  isCuteActive
                    ? "linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)"
                    : "#1a4d2e"
                }
                color="white"
                _hover={
                  isCuteActive
                    ? {
                        opacity: 0.92,
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(236, 72, 153, 0.35)",
                      }
                    : {
                        bg: "#133821",
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                      }
                }
                _active={{ transform: "translateY(0)" }}
                onClick={handleExport}
                isDisabled={selectedFields.length === 0}
                borderRadius="lg"
                fontWeight="600"
                fontSize="xs"
                boxShadow="sm"
                px={4}
              >
                {isCuteActive
                  ? `Export with Love 💕 (${selectedFields.length})`
                  : `Export ${selectedFields.length} Columns (.xlsx)`}
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomExcelExportModal;
