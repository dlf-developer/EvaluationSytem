import * as XLSX from "xlsx";

// ── Score calculation for Form 3 (Notebook Checking) ─────────────────────────
export const calculateNotebookScore = (formName) => {
  let totalScore = 0;
  let outOfScore = 0;
  if (!formName || typeof formName !== "object") return { totalScore, outOfScore };
  const keys = [
    "maintenanceOfNotebooks",
    "qualityOfOppurtunities",
    "qualityOfTeacherFeedback",
    "qualityOfLearner",
  ];
  keys.forEach((section) => {
    if (formName?.[section] && Array.isArray(formName[section])) {
      formName[section].forEach((item) => {
        const raw = item?.answer !== undefined && item?.answer !== null ? item.answer : item?.value ?? item?.score;
        if (raw !== undefined && raw !== null && raw !== "") {
          const num = Number(raw);
          if (!isNaN(num) && [1, 2, 3].includes(num)) {
            totalScore += num;
            outOfScore += 3;
          }
        }
      });
    }
  });
  return { totalScore, outOfScore };
};

// ── Extract Teacher Name cleanly from any form record or exported row ─────────
export const getRecordTeacherName = (record = {}, row = {}) => {
  // 1. From record object
  if (record?.teacherID && typeof record.teacherID === "object" && record.teacherID.name) {
    return String(record.teacherID.name).trim();
  }
  if (typeof record?.teacherID === "string" && record.teacherID.trim()) {
    return record.teacherID.trim();
  }
  if (record?.grenralDetails?.NameoftheVisitingTeacher) {
    const vt = record.grenralDetails.NameoftheVisitingTeacher;
    if (typeof vt === "object" && vt?.name) return String(vt.name).trim();
    if (typeof vt === "string" && vt.trim()) return vt.trim();
  }
  if (record?.teacherId) {
    if (typeof record.teacherId === "object" && record.teacherId?.name) {
      return String(record.teacherId.name).trim();
    }
    if (typeof record.teacherId === "string" && record.teacherId.trim()) {
      return record.teacherId.trim();
    }
  }
  if (record?.teacherName && typeof record.teacherName === "string" && record.teacherName.trim()) {
    return record.teacherName.trim();
  }
  if (record?.teacher && typeof record.teacher === "object" && record.teacher.name) {
    return String(record.teacher.name).trim();
  }
  if (record?.createdBy && typeof record.createdBy === "object" && record.createdBy.name) {
    // If user access is Teacher or record has no observer field
    return String(record.createdBy.name).trim();
  }
  if (record?.userId && typeof record.userId === "object" && record.userId.name) {
    return String(record.userId.name).trim();
  }

  // 2. Fallback to exported row properties
  if (row && typeof row === "object") {
    const possibleKeys = [
      "Teacher Name",
      "Teacher",
      "teacherName",
      "TeacherName",
      "Visiting Teacher",
    ];
    for (const k of possibleKeys) {
      if (row[k] && typeof row[k] === "string" && row[k].trim() && row[k] !== "—" && row[k] !== "N/A") {
        return row[k].trim();
      }
    }
    // Search any key containing 'teacher'
    const matchKey = Object.keys(row).find(
      (k) => k.toLowerCase().includes("teacher") && !k.toLowerCase().includes("score") && !k.toLowerCase().includes("status") && !k.toLowerCase().includes("comment")
    );
    if (matchKey && row[matchKey] && typeof row[matchKey] === "string" && row[matchKey] !== "—" && row[matchKey] !== "N/A") {
      return String(row[matchKey]).trim();
    }
  }

  return "Unknown Teacher";
};

// ── Extract Teacher & Observer Scores from any record or row ─────────────────
export const extractScoresForRecord = (record = {}, row = {}) => {
  let teacherScore = null;
  let teacherMax = null;
  let teacherPercent = null;

  let observerScore = null;
  let observerMax = null;
  let observerPercent = null;

  // 1. Form 3 (Notebook Checking)
  if (record?.TeacherForm && typeof record.TeacherForm === "object") {
    const res = calculateNotebookScore(record.TeacherForm);
    if (res.outOfScore > 0) {
      teacherScore = res.totalScore;
      teacherMax = res.outOfScore;
      teacherPercent = (res.totalScore / res.outOfScore) * 100;
    }
  }
  if (record?.ObserverForm && typeof record.ObserverForm === "object") {
    const res = calculateNotebookScore(record.ObserverForm);
    if (res.outOfScore > 0) {
      observerScore = res.totalScore;
      observerMax = res.outOfScore;
      observerPercent = (res.totalScore / res.outOfScore) * 100;
    }
  }

  // 2. Pre-computed scores (Form 1 / generic)
  if (teacherScore === null && record?.teacherScore !== undefined && record?.teacherScore !== null) {
    const sc = parseFloat(record.teacherScore);
    const tot = parseFloat(record.teacherTotal);
    if (!isNaN(sc)) {
      teacherScore = sc;
      if (!isNaN(tot) && tot > 0) {
        teacherMax = tot;
        teacherPercent = (sc / tot) * 100;
      }
    }
  }
  if (observerScore === null && record?.observerScore !== undefined && record?.observerScore !== null) {
    const sc = parseFloat(record.observerScore);
    const tot = parseFloat(record.observerTotal);
    if (!isNaN(sc)) {
      observerScore = sc;
      if (!isNaN(tot) && tot > 0) {
        observerMax = tot;
        observerPercent = (sc / tot) * 100;
      }
    }
  }

  // 3. Raw Form 1 question answers (Yes=1, Sometimes=0.5, No=0)
  if (teacherScore === null && record?.teacherForm && typeof record.teacherForm === "object") {
    let sc = 0;
    let tot = 0;
    Object.values(record.teacherForm).forEach((ans) => {
      if (ans === "Yes") { sc += 1; tot += 1; }
      else if (ans === "No") { tot += 1; }
      else if (ans === "Sometimes" || ans === "0.5") { sc += 0.5; tot += 1; }
    });
    if (tot > 0) {
      teacherScore = sc;
      teacherMax = tot;
      teacherPercent = (sc / tot) * 100;
    }
  }
  if (observerScore === null && record?.observerForm && typeof record.observerForm === "object") {
    let sc = 0;
    let tot = 0;
    Object.values(record.observerForm).forEach((ans) => {
      if (ans === "Yes") { sc += 1; tot += 1; }
      else if (ans === "No") { tot += 1; }
      else if (ans === "Sometimes" || ans === "0.5") { sc += 0.5; tot += 1; }
    });
    if (tot > 0) {
      observerScore = sc;
      observerMax = tot;
      observerPercent = (sc / tot) * 100;
    }
  }

  // 4. Form 2 (Walkthrough) & Form 5 (Co-Scholastic)
  if (observerScore === null && (record?.totalScores !== undefined || record?.scoreOutof !== undefined)) {
    const sc = parseFloat(record.totalScores);
    const tot = parseFloat(record.scoreOutof);
    if (!isNaN(sc)) {
      observerScore = sc;
      if (!isNaN(tot) && tot > 0) {
        observerMax = tot;
        observerPercent = (sc / tot) * 100;
      } else if (record?.percentageScore) {
        observerPercent = parseFloat(record.percentageScore);
      }
    }
  }

  // 5. Fallback from exported row cell values (if row object provided)
  if (row && typeof row === "object") {
    const parseCellScore = (val) => {
      if (val === null || val === undefined || val === "" || val === "—" || val === "N/A") {
        return null;
      }
      const str = String(val).trim();
      if (str.includes("/")) {
        const parts = str.split("/");
        const sc = parseFloat(parts[0]);
        const mx = parseFloat(parts[1]);
        if (!isNaN(sc) && !isNaN(mx) && mx > 0) {
          return { score: sc, max: mx, percent: (sc / mx) * 100 };
        }
      }
      if (str.includes("%")) {
        const p = parseFloat(str.replace("%", "").trim());
        if (!isNaN(p)) return { score: null, max: null, percent: p };
      }
      const num = parseFloat(str);
      if (!isNaN(num)) return { score: num, max: null, percent: null };
      return null;
    };

    if (teacherScore === null || teacherMax === null) {
      const tKey = Object.keys(row).find(
        (k) =>
          k.toLowerCase().includes("teacher") &&
          k.toLowerCase().includes("score") &&
          !k.toLowerCase().includes("%") &&
          !k.toLowerCase().includes("out of") &&
          !k.toLowerCase().includes("outof")
      );
      if (tKey) {
        const parsed = parseCellScore(row[tKey]);
        if (parsed) {
          if (teacherScore === null) teacherScore = parsed.score;
          if (parsed.max && teacherMax === null) teacherMax = parsed.max;
          if (parsed.percent && teacherPercent === null) teacherPercent = parsed.percent;
        }
      }
      // Check for Out Of / Max column in row
      if (teacherMax === null) {
        const tMaxKey = Object.keys(row).find(
          (k) =>
            k.toLowerCase().includes("teacher") &&
            (k.toLowerCase().includes("out of") ||
              k.toLowerCase().includes("outof") ||
              k.toLowerCase().includes("max") ||
              k.toLowerCase().includes("total"))
        );
        if (tMaxKey) {
          const num = parseFloat(String(row[tMaxKey]).replace(/[^\d.]/g, ""));
          if (!isNaN(num) && num > 0) teacherMax = num;
        }
      }
      // Check for Teacher % column
      if (teacherPercent === null) {
        const tpKey = Object.keys(row).find(
          (k) =>
            k.toLowerCase().includes("teacher") &&
            (k.includes("%") || k.toLowerCase().includes("percentage"))
        );
        if (tpKey) {
          const parsed = parseCellScore(row[tpKey]);
          if (parsed?.percent) teacherPercent = parsed.percent;
        }
      }
    }

    if (observerScore === null || observerMax === null) {
      const oKey = Object.keys(row).find(
        (k) =>
          (k.toLowerCase().includes("observer") || k.toLowerCase().includes("observation")) &&
          k.toLowerCase().includes("score") &&
          !k.toLowerCase().includes("%") &&
          !k.toLowerCase().includes("out of") &&
          !k.toLowerCase().includes("outof")
      );
      if (oKey) {
        const parsed = parseCellScore(row[oKey]);
        if (parsed) {
          if (observerScore === null) observerScore = parsed.score;
          if (parsed.max && observerMax === null) observerMax = parsed.max;
          if (parsed.percent && observerPercent === null) observerPercent = parsed.percent;
        }
      }
      // Check for Out Of / Max column in row
      if (observerMax === null) {
        const oMaxKey = Object.keys(row).find(
          (k) =>
            (k.toLowerCase().includes("observer") || k.toLowerCase().includes("observation")) &&
            (k.toLowerCase().includes("out of") ||
              k.toLowerCase().includes("outof") ||
              k.toLowerCase().includes("max") ||
              k.toLowerCase().includes("total"))
        );
        if (oMaxKey) {
          const num = parseFloat(String(row[oMaxKey]).replace(/[^\d.]/g, ""));
          if (!isNaN(num) && num > 0) observerMax = num;
        }
      }
      // Check for Observer % column
      if (observerPercent === null) {
        const opKey = Object.keys(row).find(
          (k) =>
            (k.toLowerCase().includes("observer") || k.toLowerCase().includes("observation")) &&
            (k.includes("%") || k.toLowerCase().includes("percentage"))
        );
        if (opKey) {
          const parsed = parseCellScore(row[opKey]);
          if (parsed?.percent) observerPercent = parsed.percent;
        }
      }
    }
  }

  // Validate Teacher Score & Max pair
  let validTScore = null;
  let validTMax = null;
  let validTPct = null;
  if (
    teacherScore !== null &&
    !isNaN(teacherScore) &&
    teacherMax !== null &&
    !isNaN(teacherMax) &&
    teacherMax > 0
  ) {
    validTScore = teacherScore;
    validTMax = teacherMax;
    validTPct =
      teacherPercent !== null && !isNaN(teacherPercent)
        ? teacherPercent
        : (teacherScore / teacherMax) * 100;
  }

  // Validate Observer Score & Max pair
  let validOScore = null;
  let validOMax = null;
  let validOPct = null;
  if (
    observerScore !== null &&
    !isNaN(observerScore) &&
    observerMax !== null &&
    !isNaN(observerMax) &&
    observerMax > 0
  ) {
    validOScore = observerScore;
    validOMax = observerMax;
    validOPct =
      observerPercent !== null && !isNaN(observerPercent)
        ? observerPercent
        : (observerScore / observerMax) * 100;
  }

  return {
    teacherScore: validTScore,
    teacherMax: validTMax,
    teacherPercent: validTPct,
    observerScore: validOScore,
    observerMax: validOMax,
    observerPercent: validOPct,
  };
};

// ── Format number to 1 decimal place or integer ──────────────────────────────
const formatNum = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
};

// ── Build Teacher-Wise Summary with Average Scores & Breakdowns ──────────────
export const buildTeacherAverageSummary = (records = [], rows = []) => {
  if (!Array.isArray(records) || records.length === 0) return null;

  const teacherMap = new Map();

  records.forEach((record, idx) => {
    const row = rows[idx] || {};
    const teacherName = getRecordTeacherName(record, row);
    const normKey = teacherName.toLowerCase().replace(/\s+/g, " ");

    if (!teacherMap.has(normKey)) {
      teacherMap.set(normKey, {
        displayName: teacherName,
        observations: 0,
        teacherObs: [],
        observerObs: [],
      });
    }

    const group = teacherMap.get(normKey);
    group.observations += 1;

    const {
      teacherScore,
      teacherMax,
      teacherPercent,
      observerScore,
      observerMax,
      observerPercent,
    } = extractScoresForRecord(record, row);

    group.teacherObs.push({
      score: teacherScore,
      max: teacherMax,
      percent: teacherPercent,
    });

    group.observerObs.push({
      score: observerScore,
      max: observerMax,
      percent: observerPercent,
    });
  });

  const summaryList = [];
  const allValidT = [];
  const allValidO = [];

  teacherMap.forEach((group) => {
    // 1. Teacher Scores Breakdown & Average
    const validT = group.teacherObs.filter((o) => o.score !== null && o.max > 0);
    const avgTScore = validT.length
      ? validT.reduce((a, b) => a + b.score, 0) / validT.length
      : null;
    const avgTMax = validT.length
      ? validT.reduce((a, b) => a + b.max, 0) / validT.length
      : null;
    const avgTPct = validT.length
      ? validT.reduce((a, b) => a + b.percent, 0) / validT.length
      : null;

    const teacherBreakdown = group.teacherObs
      .map((o) => {
        if (o.score !== null && o.max > 0) {
          return `${formatNum(o.score)}/${formatNum(o.max)} (${o.percent.toFixed(1)}%)`;
        }
        return `Pending`;
      })
      .join(", ");

    // 2. Observer Scores Breakdown & Average
    const validO = group.observerObs.filter((o) => o.score !== null && o.max > 0);
    const avgOScore = validO.length
      ? validO.reduce((a, b) => a + b.score, 0) / validO.length
      : null;
    const avgOMax = validO.length
      ? validO.reduce((a, b) => a + b.max, 0) / validO.length
      : null;
    const avgOPct = validO.length
      ? validO.reduce((a, b) => a + b.percent, 0) / validO.length
      : null;

    const observerBreakdown = group.observerObs
      .map((o) => {
        if (o.score !== null && o.max > 0) {
          return `${formatNum(o.score)}/${formatNum(o.max)} (${o.percent.toFixed(1)}%)`;
        }
        return `Pending`;
      })
      .join(", ");

    if (validT.length) allValidT.push(...validT);
    if (validO.length) allValidO.push(...validO);

    const formatScore = (sc, mx) => {
      if (sc === null || isNaN(sc)) return "N/A";
      const scStr = formatNum(sc);
      if (mx !== null && !isNaN(mx)) {
        return `${scStr} / ${formatNum(mx)}`;
      }
      return scStr;
    };

    summaryList.push({
      teacherName: group.displayName,
      observations: group.observations,
      teacherScoresBreakdown: teacherBreakdown,
      avgTeacherScore: formatScore(avgTScore, avgTMax),
      avgTeacherPercent: avgTPct !== null ? `${avgTPct.toFixed(1)}%` : "N/A",
      observerScoresBreakdown: observerBreakdown,
      avgObserverScore: formatScore(avgOScore, avgOMax),
      avgObserverPercent: avgOPct !== null ? `${avgOPct.toFixed(1)}%` : "N/A",
    });
  });

  // Sort alphabetically by teacher name
  summaryList.sort((a, b) => a.teacherName.localeCompare(b.teacherName));

  // Compute Overall Cohort Totals
  const totalObs = records.length;
  const overallTScore = allValidT.length
    ? allValidT.reduce((a, b) => a + b.score, 0) / allValidT.length
    : null;
  const overallTMax = allValidT.length
    ? allValidT.reduce((a, b) => a + b.max, 0) / allValidT.length
    : null;
  const overallTPercent = allValidT.length
    ? allValidT.reduce((a, b) => a + b.percent, 0) / allValidT.length
    : null;

  const overallOScore = allValidO.length
    ? allValidO.reduce((a, b) => a + b.score, 0) / allValidO.length
    : null;
  const overallOMax = allValidO.length
    ? allValidO.reduce((a, b) => a + b.max, 0) / allValidO.length
    : null;
  const overallOPercent = allValidO.length
    ? allValidO.reduce((a, b) => a + b.percent, 0) / allValidO.length
    : null;

  const formatScore = (sc, mx) => {
    if (sc === null || isNaN(sc)) return "N/A";
    const scStr = formatNum(sc);
    if (mx !== null && !isNaN(mx)) {
      return `${scStr} / ${formatNum(mx)}`;
    }
    return scStr;
  };

  const overall = {
    teacherName: "OVERALL COHORT AVERAGE (ALL TEACHERS)",
    observations: totalObs,
    teacherScoresBreakdown: `Cohort Average Across ${allValidT.length} Scored Evaluation(s)`,
    avgTeacherScore: formatScore(overallTScore, overallTMax),
    avgTeacherPercent: overallTPercent !== null ? `${overallTPercent.toFixed(1)}%` : "N/A",
    observerScoresBreakdown: `Cohort Average Across ${allValidO.length} Scored Evaluation(s)`,
    avgObserverScore: formatScore(overallOScore, overallOMax),
    avgObserverPercent: overallOPercent !== null ? `${overallOPercent.toFixed(1)}%` : "N/A",
  };

  return { summaryList, overall };
};

// ── Append Teacher Summary to Worksheet & Workbook ───────────────────────────
export const appendTeacherSummaryToWorkbook = (wb, ws, records = [], rows = []) => {
  const result = buildTeacherAverageSummary(records, rows);
  if (!result) return;

  const { summaryList, overall } = result;

  // 1. Append Summary Rows in the last of the active worksheet
  const summaryAoa = [
    [], // Blank row 1
    [], // Blank row 2
    ["📊 TEACHER SCORE & OBSERVER SCORE SUMMARY (AVERAGES)"],
    [
      "Teacher Name",
      "Total Observations",
      "All Teacher Scores",
      "Average Teacher Score",
      "Average Teacher Score (%)",
      "All Observer Scores",
      "Average Observer Score",
      "Average Observer Score (%)",
    ],
    ...summaryList.map((t) => [
      t.teacherName,
      t.observations,
      t.teacherScoresBreakdown,
      t.avgTeacherScore,
      t.avgTeacherPercent,
      t.observerScoresBreakdown,
      t.avgObserverScore,
      t.avgObserverPercent,
    ]),
    [
      overall.teacherName,
      overall.observations,
      overall.teacherScoresBreakdown,
      overall.avgTeacherScore,
      overall.avgTeacherPercent,
      overall.observerScoresBreakdown,
      overall.avgObserverScore,
      overall.avgObserverPercent,
    ],
  ];

  XLSX.utils.sheet_add_aoa(ws, summaryAoa, { origin: -1 });

  // Ensure column widths can display the summary headers comfortably
  if (Array.isArray(ws["!cols"])) {
    ws["!cols"][0] = { wch: Math.max(ws["!cols"][0]?.wch || 12, 34) };
    ws["!cols"][1] = { wch: Math.max(ws["!cols"][1]?.wch || 12, 18) };
    ws["!cols"][2] = { wch: Math.max(ws["!cols"][2]?.wch || 12, 45) };
    ws["!cols"][3] = { wch: Math.max(ws["!cols"][3]?.wch || 12, 20) };
    ws["!cols"][4] = { wch: Math.max(ws["!cols"][4]?.wch || 12, 22) };
    ws["!cols"][5] = { wch: Math.max(ws["!cols"][5]?.wch || 12, 45) };
    ws["!cols"][6] = { wch: Math.max(ws["!cols"][6]?.wch || 12, 20) };
    ws["!cols"][7] = { wch: Math.max(ws["!cols"][7]?.wch || 12, 22) };
  }

  // 2. Add Dedicated Second Sheet Tab in Workbook
  const summarySheetRows = [
    ...summaryList.map((t) => ({
      "Teacher Name": t.teacherName,
      "Total Observations": t.observations,
      "All Teacher Scores": t.teacherScoresBreakdown,
      "Avg Teacher Score": t.avgTeacherScore,
      "Avg Teacher Score (%)": t.avgTeacherPercent,
      "All Observer Scores": t.observerScoresBreakdown,
      "Avg Observer Score": t.avgObserverScore,
      "Avg Observer Score (%)": t.avgObserverPercent,
    })),
    {
      "Teacher Name": overall.teacherName,
      "Total Observations": overall.observations,
      "All Teacher Scores": overall.teacherScoresBreakdown,
      "Avg Teacher Score": overall.avgTeacherScore,
      "Avg Teacher Score (%)": overall.avgTeacherPercent,
      "All Observer Scores": overall.observerScoresBreakdown,
      "Avg Observer Score": overall.avgObserverScore,
      "Avg Observer Score (%)": overall.avgObserverPercent,
    },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summarySheetRows);
  wsSummary["!cols"] = [
    { wch: 34 },
    { wch: 18 },
    { wch: 45 },
    { wch: 20 },
    { wch: 22 },
    { wch: 45 },
    { wch: 20 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Teacher Averages Summary");
};

// ── Robust Browser File Downloader ──────────────────────────────────────────
export const downloadWorkbook = (wb, fileName) => {
  try {
    if (typeof window === "undefined" || !window.document) {
      XLSX.writeFile(wb, fileName);
      return true;
    }
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 2000);
    return true;
  } catch (err) {
    console.error("downloadWorkbook fallback to XLSX.writeFile:", err);
    try {
      XLSX.writeFile(wb, fileName);
      return true;
    } catch (e2) {
      console.error("XLSX.writeFile fallback error:", e2);
      return false;
    }
  }
};

// ── Export Teacher Averages as an Independent 2nd Excel File ─────────────────
export const exportTeacherAveragesWorkbook = (records = [], rows = [], baseFileName = "report") => {
  const result = buildTeacherAverageSummary(records, rows);
  if (!result) return false;

  const { summaryList, overall } = result;

  const summarySheetRows = [
    ...summaryList.map((t) => ({
      "Teacher Name": t.teacherName,
      "Total Observations": t.observations,
      "All Teacher Scores": t.teacherScoresBreakdown,
      "Avg Teacher Score": t.avgTeacherScore,
      "Avg Teacher Score (%)": t.avgTeacherPercent,
      "All Observer Scores": t.observerScoresBreakdown,
      "Avg Observer Score": t.avgObserverScore,
      "Avg Observer Score (%)": t.avgObserverPercent,
    })),
    {
      "Teacher Name": overall.teacherName,
      "Total Observations": overall.observations,
      "All Teacher Scores": overall.teacherScoresBreakdown,
      "Avg Teacher Score": overall.avgTeacherScore,
      "Avg Teacher Score (%)": overall.avgTeacherPercent,
      "All Observer Scores": overall.observerScoresBreakdown,
      "Avg Observer Score": overall.avgObserverScore,
      "Avg Observer Score (%)": overall.avgObserverPercent,
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summarySheetRows);
  ws["!cols"] = [
    { wch: 34 },
    { wch: 18 },
    { wch: 45 },
    { wch: 20 },
    { wch: 22 },
    { wch: 45 },
    { wch: 20 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Teacher Averages");

  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanBase = (baseFileName || "report").replace(/_custom_export.*$/, "");
  const fileName = `${cleanBase}_teacher_averages_${dateStr}.xlsx`;
  return downloadWorkbook(wb, fileName);
};


