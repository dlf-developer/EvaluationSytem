import { isDLWS } from "../../../../Utils/env";

// Shared / DLPS Monthly Coordinator Report Questions (19 questions — kept intact for DLPS)
export const inputsWingDLPS = [
  {
    question: "Morning Assembly Planning & Coordination",
    type: "table",
    columns: ["Date", "Class on Duty", "Theme of the Assembly", "Highlights", "Any Reward?", "Any Issues Faced?"],
  },
  {
    question: "Anecdotal Records Updated? Any Concerns?",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "PD Sessions Attended by WC and Team? Teachers Updated it on Edunext?",
    type: "text",
  },
  {
    question: "I C.A.R.E Certificates for the Month?",
    type: "table",
    columns: ["Date", "Student Name", "Class", "Whether posted on edunext", "Content"],
  },
  {
    question: "Experiential Think Rooms / Micro Teaching Sessions Attended ",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Key Outcomes of Result Discussion?",
    type: "table",
    columns: [
      "Concern subjects and class",
      "High achiever Subjects and class",
      "Any smilye awarded to class",
      "Any smilye awarded to teacher",
    ],
    allowFileUpload: true,
  },
  {
    question: "Identified Learners on the Way (L.O.W.)",
    type: "table",
    columns: ["Name", "Class Section", "Subject", "Strength of child", "Action plan", "Remarks"],
    allowFileUpload: true,
  },
  {
    question: "C.W.S.N Names & Progress",
    type: "table",
    columns: [
      "Name of Student",
      "Class & Sec.",
      "Identified using PRASHAST Checklists (Y/N)",
      "Receiving Sensorium / Counsellor Intervention (Y/N)",
      "Diagnosis",
      "Half yearly progress",
      "Team Meetings Conducted Offline or Online (Y/N)",
    ],
  },
  {
    question: "Parent Meetings (Online/Offline)",
    type: "table",
    columns: ["Date", "Name of the Teacher", "Name of the Student", "Class & Section", "Reason of Meeting", "Outcome of meeting"],
    allowFileUpload: true,
  },
  {
    question: "Detention arranged/ Extra input classes",
    type: "table",
    columns: ["Date", "Detention/extra input class?", "Name of the MT/ST/WC", "Name of the Students", "Class & Section", "Name of the subject", "Outcome"],
  },
  {
    question: "Care Calls & Sunshine Calls Made?",
    legacyQuestions: ["Care Calls Made"],
    type: "table",
    columns: ["Date", "Name of the MT/ST/WC", "Name of the Student", "Class & Section", "Reason", "Outcome"],
    allowFileUpload: true,
  },
  {
    question: "Reflection Forms Filled",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Last Syllabus Completion Check Date",
    type: "text",
  },
  {
    question: "Class and Subject Work Status",
    type: "table",
    columns: [
      "Date",
      "Class",
      "Name of student",
      "Subject",
      "Status of work",
      "Status of checking",
      "Feedback/Action plan",
    ],
  },
  {
    question: "Excursions Planned",
    type: "table",
    columns: [
      "Date of excursion",
      "Class",
      "Venue",
      "Teachers accompany",
      "Feedback/concerns",
    ],
  },
  {
    question: "Hygiene Concerns (Washrooms)",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Concerns Flagged During Dispersal",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Safety Concerns Observed",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Additional Comments? (+ve / -ve)",
    type: "text",
  },
];

// DLWS Monthly Coordinator Report Questions (20 questions)
export const inputsWingDLWS = [
  {
    question: "Morning Assembly Planning & Coordination",
    type: "table",
    columns: ["Date", "Class on Duty", "Theme of the Assembly", "Highlights", "Any Reward?", "Any Issues Faced?"],
  },
  {
    question: "Report of Major Activities Conducted",
    type: "table",
    columns: ["Date", "Classes", "Venue", "What went well?", "What could've been better?"],
  },
  {
    question: "Cumulative Records, KYC, and PTM Records Updated on Edunext?",
    legacyQuestions: ["Anecdotal Records Updated? Any Concerns?"],
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "PD Sessions Attended by WC and Team? Teachers Updated it on Edunext?",
    type: "text",
  },
  {
    question: "I C.A.R.E Certificates for the Month?",
    type: "table",
    columns: ["Date", "Student Name", "Class", "Whether posted on edunext", "Content"],
  },
  {
    question: "Experiential Think Rooms / Micro Teaching Sessions Attended ",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Key Outcomes of Result Discussion?",
    type: "table",
    columns: [
      "Concern subjects and class",
      "High achiever Subjects and class",
      "Any smilye awarded to class",
      "Any smilye awarded to teacher",
    ],
    allowFileUpload: true,
  },
  {
    question: "Identified Learners on the Way (L.O.W.)",
    type: "table",
    columns: ["Name", "Class Section", "Subject", "Strength of child", "Action plan", "Remarks"],
    allowFileUpload: true,
  },
  {
    question: "C.W.S.N Names & Progress",
    type: "table",
    columns: [
      "Name of Student",
      "Class & Sec.",
      "Identified using PRASHAST Checklists (Y/N)",
      "Receiving Sensorium / Counsellor Intervention (Y/N)",
      "Diagnosis",
      "Half yearly progress",
      "Team Meetings Conducted Offline or Online (Y/N)",
    ],
  },
  {
    question: "Parent Meetings (Online/Offline)",
    type: "table",
    columns: ["Date", "Name of the Teacher", "Name of the Student", "Class & Section", "Reason of Meeting", "Outcome of meeting"],
    allowFileUpload: true,
  },
  {
    question: "Detention arranged/ Extra input classes",
    type: "table",
    columns: ["Date", "Detention/extra input class?", "Name of the MT/ST/WC", "Name of the Students", "Class & Section", "Name of the subject", "Outcome"],
  },
  {
    question: "Care Calls & Sunshine Calls Made?",
    legacyQuestions: ["Care Calls Made"],
    type: "table",
    columns: ["Date", "Name of the MT/ST/WC", "Name of the Student", "Class & Section", "Reason", "Outcome"],
    allowFileUpload: true,
  },
  {
    question: "Reflection Forms Filled",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Last Syllabus Completion Check Date",
    type: "text",
  },
  {
    question: "Class and Subject Work Status",
    type: "table",
    columns: [
      "Date",
      "Class",
      "Name of student",
      "Subject",
      "Status of work",
      "Status of checking",
      "Feedback/Action plan",
    ],
  },
  {
    question: "Excursions Planned",
    type: "table",
    columns: [
      "Date of excursion",
      "Class",
      "Venue",
      "Teachers accompany",
      "Feedback/concerns",
    ],
  },
  {
    question: "List of Grievances for the Month?",
    legacyQuestions: ["Hygiene Concerns (Washrooms)"],
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Concerns Flagged During Dispersal",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Any Concerns in regards to Teachers? One on One meetings conducted?",
    legacyQuestions: ["Safety Concerns Observed"],
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Additional Comments? (+ve / -ve)",
    type: "text",
  },
];

export const getWingInputs = (backendHint) =>
  isDLWS(backendHint) ? inputsWingDLWS : inputsWingDLPS;

export const inputsWing = getWingInputs();

export const normalizeQuestionTitle = (title) =>
  String(title || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export const sanitizeTableData = (raw, columnCount) => {
  if (!Array.isArray(raw) || raw.length === 0) return [{}];
  const cleaned = raw.map((row) => {
    if (!row || typeof row !== "object") return {};
    if (typeof columnCount !== "number") return row;
    const pruned = {};
    Object.keys(row).forEach((key) => {
      const match = /^col_(\d+)$/.exec(key);
      if (!match || Number(match[1]) < columnCount) {
        pruned[key] = row[key];
      }
    });
    return pruned;
  });
  return cleaned.length > 0 ? cleaned : [{}];
};

/**
 * Aligns saved DB or localStorage draft monthlyReport entries with the target
 * question schema by question title / legacy alias instead of brittle raw index.
 */
export const mergeWingReportItems = (
  questions = [],
  savedItems = [],
  fallbackItems = null
) => {
  const safeSaved = Array.isArray(savedItems) ? savedItems : [];
  const safeFallback = Array.isArray(fallbackItems) ? fallbackItems : [];
  const hasQuestionLabels = safeSaved.some((item) => Boolean(item?.question));
  const usedIndices = new Set();
  const matchedByIdx = new Array(questions.length).fill(null);

  questions.forEach((inp, idx) => {
    const targetKey = normalizeQuestionTitle(inp.question);
    const matchIdx = safeSaved.findIndex(
      (item, sIdx) =>
        !usedIndices.has(sIdx) &&
        normalizeQuestionTitle(item?.question) === targetKey
    );
    if (matchIdx !== -1) {
      usedIndices.add(matchIdx);
      matchedByIdx[idx] = safeSaved[matchIdx];
    }
  });

  questions.forEach((inp, idx) => {
    if (matchedByIdx[idx] || !Array.isArray(inp.legacyQuestions)) return;
    const legacyKeys = inp.legacyQuestions.map(normalizeQuestionTitle);
    const matchIdx = safeSaved.findIndex(
      (item, sIdx) =>
        !usedIndices.has(sIdx) &&
        legacyKeys.includes(normalizeQuestionTitle(item?.question))
    );
    if (matchIdx !== -1) {
      usedIndices.add(matchIdx);
      matchedByIdx[idx] = safeSaved[matchIdx];
    }
  });

  if (!hasQuestionLabels) {
    questions.forEach((_, idx) => {
      if (!matchedByIdx[idx] && safeSaved[idx]) {
        matchedByIdx[idx] = safeSaved[idx];
      }
    });
  }

  return questions.map((inp, idx) => {
    const existing = matchedByIdx[idx] || safeFallback[idx] || null;
    const colCount = Array.isArray(inp.columns) ? inp.columns.length : undefined;

    let tableData = sanitizeTableData(existing?.tableData, colCount);

    // Backward compatibility for C.W.S.N question when transitioning from 6 to 7 columns
    if (
      normalizeQuestionTitle(inp.question) === normalizeQuestionTitle("C.W.S.N Names & Progress") &&
      Array.isArray(tableData)
    ) {
      tableData = tableData.map((row) => {
        if (!row || typeof row !== "object") return row;
        // If col_5 exists but col_6 is undefined, this was saved in the 6-column format
        if (row.col_5 !== undefined && row.col_6 === undefined) {
          return {
            ...row,
            col_0: row.col_0 || "",
            col_1: "", // New separate Class & Sec column
            col_2: row.col_1 || "",
            col_3: row.col_2 || "",
            col_4: row.col_3 || "",
            col_5: row.col_4 || "",
            col_6: row.col_5 || "",
          };
        }
        return row;
      });
    }

    return {
      question: inp.question,
      type: inp.type,
      columns: inp.columns,
      allowFileUpload: inp.allowFileUpload,
      answer: existing?.answer || "",
      tableData,
      files: Array.isArray(existing?.files)
        ? existing.files
        : existing?.files && typeof existing.files === "object"
        ? Object.values(existing.files)
        : [],
    };
  });
};
