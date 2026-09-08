import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { LOGO_BASE64, BANNER_BASE64 } from "../logoAssets";
import { getAllTimes } from "../../../Utils/auth";
import { PDF_FONT } from "../pdfFonts"; // registers NotoSansDevanagari (Hindi + Latin)

const C = {
  primary: "#4A6741",
  primaryLight: "#EAF0E8",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  border: "#D1D5DB",
  white: "#FFFFFF",
  text: "#2D2A26",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: PDF_FONT,
    fontSize: 8,
    padding: 18,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logo: { width: 40, height: 48 },
  logoBanner: { width: 150, height: 38, marginLeft: 10 },
  reportTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.primary,
    textAlign: "center",
    marginBottom: 2,
  },
  pageNum: { fontSize: 7, color: C.gray, textAlign: "right", marginBottom: 4 },

  // Meta
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4, marginTop: 3 },
  metaItem: { width: "25%", paddingVertical: 2, paddingHorizontal: 3 },
  metaItem33: { width: "33.33%", paddingVertical: 2, paddingHorizontal: 3 },
  metaLabel: { fontSize: 6.5, color: C.gray, marginBottom: 1, textTransform: "uppercase" },
  metaValue: { fontSize: 8, fontWeight: "bold", color: C.text },

  // Section heading
  sectionHead: {
    backgroundColor: C.primary,
    color: C.white,
    padding: 4,
    fontSize: 8.5,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubHead: {
    backgroundColor: C.primaryLight,
    color: C.primary,
    padding: 3,
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 3,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
    marginTop: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowLast: {
    flexDirection: "row",
  },
  th: {
    backgroundColor: C.lightGray,
    padding: 3,
    fontWeight: "bold",
    fontSize: 6.5,
    color: C.text,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  td: {
    padding: 3,
    fontSize: 6.5,
    color: C.text,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  thLast: {
    backgroundColor: C.lightGray,
    padding: 3,
    fontWeight: "bold",
    fontSize: 6.5,
    color: C.text,
  },
  tdLast: {
    padding: 3,
    fontSize: 6.5,
    color: C.text,
  },
  col50: { width: "50%", borderRightWidth: 1, borderRightColor: C.border },
  col50Last: { width: "50%" },

  // Score row
  scoreRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 3, marginBottom: 3 },
  scoreBox: {
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 3,
    padding: 3,
    marginLeft: 4,
    alignItems: "center",
    minWidth: 55,
  },
  scoreLabel: { fontSize: 6, color: C.gray, marginBottom: 1 },
  scoreValue: { fontSize: 8.5, fontWeight: "bold", color: C.primary },

  // Feedback
  qBox: { marginBottom: 6, paddingBottom: 2 },
  qLabel: { fontSize: 7.5, color: C.gray, marginBottom: 2, fontWeight: "bold" },
  qAnswer: { fontSize: 7.5, color: C.text },

  // Record separator
  recordBox: { marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.border },
});

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => getAllTimes(d)?.formattedDate2 ?? "—";

const form1Score = (form) => {
  if (!form) return { score: 0, total: 0 };
  const vals = Object.values(form).filter((v) => ["Yes", "No", "Sometimes", "N/A"].includes(v));
  const score = Object.values(form).reduce((s, v) => s + (v === "Yes" ? 1 : v === "Sometimes" ? 0.5 : 0), 0);
  return { score, total: vals.length };
};

const form3Score = (formName) => {
  let score = 0, total = 0;
  ["maintenanceOfNotebooks", "qualityOfOppurtunities", "qualityOfTeacherFeedback", "qualityOfLearner"].forEach((k) => {
    if (formName?.[k]) {
      formName[k].forEach((i) => {
        if (["1", "2", "3"].includes(i?.answer)) { score += parseInt(i.answer, 10); total += 3; }
      });
    }
  });
  return { score, total };
};

/**
 * Calculates explicit percentage widths for table columns so React-PDF (Yoga)
 * can accurately measure multiline text height and prevent row overlap bugs.
 */
const getColumnWidths = (columns = []) => {
  if (!columns || columns.length === 0) return { sNoWidth: "8%", colWidths: [] };

  const n = columns.length;
  const sNoWidth = n <= 2 ? 8 : (n <= 4 ? 7 : (n <= 6 ? 6 : 5));
  const remaining = 100 - sNoWidth;

  const weights = columns.map((col) => {
    const lower = (col || "").toLowerCase();
    if (
      lower.includes("(y/n)") ||
      lower.includes("resolved?") ||
      lower.includes("ticket") ||
      lower.includes("reward") ||
      lower.includes("whether posted")
    ) {
      return 1.0;
    }
    if (
      lower === "date" ||
      lower.includes("date of") ||
      lower === "class" ||
      lower === "section" ||
      lower === "class section" ||
      lower === "class on duty"
    ) {
      return 1.1;
    }
    if (
      lower.includes("diagnosis") ||
      lower.includes("content") ||
      lower.includes("remarks") ||
      lower.includes("action plan") ||
      lower.includes("outcome") ||
      lower.includes("reason") ||
      lower.includes("highlights") ||
      lower.includes("feedback") ||
      lower.includes("issues")
    ) {
      return 2.8;
    }
    if (
      lower.includes("name") ||
      lower.includes("subject") ||
      lower.includes("theme") ||
      lower.includes("strength") ||
      lower.includes("progress") ||
      lower.includes("status") ||
      lower.includes("venue") ||
      lower.includes("teachers accompany") ||
      lower.includes("concern subjects") ||
      lower.includes("high achiever")
    ) {
      return 1.6;
    }
    return 1.5;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const colWidths = weights.map((w) => `${((w / totalWeight) * remaining).toFixed(2)}%`);
  return { sNoWidth: `${sNoWidth}%`, colWidths };
};

// ── Sub-components (NO fragments) ─────────────────────────────────────────────
const PageHeader = ({ title }) => (
  <View>
    <View style={s.header}>
      <Image src={LOGO_BASE64} style={s.logo} />
      <Image src={BANNER_BASE64} style={s.logoBanner} />
    </View>
    <Text style={s.reportTitle}>{title}</Text>
  </View>
);

const MetaRow = ({ label, value, isThird = false }) => (
  <View style={isThird ? s.metaItem33 : s.metaItem}>
    <Text style={s.metaLabel}>{label}</Text>
    <Text style={s.metaValue}>{value || "—"}</Text>
  </View>
);

const ScoreRow = ({ boxes }) => (
  <View style={s.scoreRow}>
    {boxes.map((b, i) => (
      <View key={i} style={s.scoreBox}>
        <Text style={s.scoreLabel}>{b.label}</Text>
        <Text style={s.scoreValue}>{b.value}</Text>
      </View>
    ))}
  </View>
);

// ── MAIN DOCUMENT ─────────────────────────────────────────────────────────────
const WingCoordinatorDoc = ({ data }) => {
  if (!data)
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <Text>Loading…</Text>
        </Page>
      </Document>
    );

  const {
    form1 = [],
    form2 = [],
    form3 = [],
    form4 = [],
    form5 = [],
    monthlyReport = [],
    range,
    className,
  } = data;

  const dateRange = range?.length === 2 ? `${fmt(range[0])} – ${fmt(range[1])}` : "—";
  const classes = Array.isArray(className) ? className.join(", ") : (className ?? "—");
  const observerName = data?.userId?.name || "—";

  return (
    <Document>

      {/* ══ COVER PAGE & MONTHLY REPORT ══════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Wing Coordinator Report" />
        <Text style={[s.qLabel, { textAlign: "center", marginBottom: 12 }]}>
          {dateRange}  |  {classes}  |  Observer: {observerName}
        </Text>

        {/* Summary table */}
        <View>
          <Text style={s.sectionHead}>Report Summary</Text>
          <View style={s.table}>
            <View style={s.tableRow} wrap={false}>
              <View style={[s.th, s.col50]}><Text>Section</Text></View>
              <View style={[s.thLast, s.col50Last]}><Text>Records</Text></View>
            </View>
            {[
              ["Fortnightly Monitor (Form 1)", form1.length],
              ["Classroom Walkthrough (Form 2)", form2.length],
              ["Notebook Checking Proforma (Form 3)", form3.length],
              ["Co-Scholastic Classroom Observation (Form 5)", form5.length],
              ["Learning Progress Checklist (Form 4)", form4.length],
            ].map(([label, count], i, arr) => (
              <View key={label} style={i === arr.length - 1 ? s.tableRowLast : s.tableRow} wrap={false}>
                <View style={[s.td, s.col50]}><Text>{label}</Text></View>
                <View style={[s.tdLast, s.col50Last]}><Text>{count}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly report */}
        {monthlyReport?.length > 0 && (
          <View>
            <Text style={s.sectionHead}>Monthly Report</Text>
            {monthlyReport.filter(Boolean).map((item, i) => {
              const columns = item.columns || [];
              const { sNoWidth, colWidths } = getColumnWidths(columns);
              const rows = item.tableData?.filter(Boolean) || [];

              return (
                <View key={i} style={s.qBox}>
                  <Text style={s.qLabel}>{item.question || "—"}</Text>
                  {item.type === "text" ? (
                    <Text style={s.qAnswer}>{item.answer || "—"}</Text>
                  ) : (
                    rows.length > 0 ? (
                      <View style={s.table}>
                        {/* Header row */}
                        <View style={s.tableRow} wrap={false}>
                          <View style={[s.th, { width: sNoWidth }]}>
                            <Text>S.No.</Text>
                          </View>
                          {columns.map((col, cIdx) => (
                            <View
                              key={cIdx}
                              style={[
                                cIdx === columns.length - 1 ? s.thLast : s.th,
                                { width: colWidths[cIdx] },
                              ]}
                            >
                              <Text>{col}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Data rows */}
                        {rows.map((row, rIdx) => (
                          <View
                            key={rIdx}
                            style={rIdx === rows.length - 1 ? s.tableRowLast : s.tableRow}
                            wrap={false}
                          >
                            <View style={[s.td, { width: sNoWidth }]}>
                              <Text>{rIdx + 1}</Text>
                            </View>
                            {columns.map((col, cIdx) => {
                              const cellVal = row?.[`col_${cIdx}`];
                              return (
                                <View
                                  key={cIdx}
                                  style={[
                                    cIdx === columns.length - 1 ? s.tdLast : s.td,
                                    { width: colWidths[cIdx] },
                                  ]}
                                >
                                  <Text>
                                    {typeof cellVal === "boolean"
                                      ? (cellVal ? "✔️" : "—")
                                      : (cellVal !== undefined && cellVal !== null && cellVal !== ""
                                          ? String(cellVal)
                                          : "—")}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={s.table}>
                        <View style={s.tableRowLast}>
                          <View style={[s.tdLast, { width: "100%" }]}>
                            <Text>No data</Text>
                          </View>
                        </View>
                      </View>
                    )
                  )}

                  {item.files?.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 7, fontWeight: "bold", color: C.gray, marginBottom: 2 }}>
                        Attached Files:
                      </Text>
                      {item.files.map((file, fIdx) => {
                        const isImage = file.url?.startsWith("data:image/") || file.type?.startsWith("image/");
                        return (
                          <View key={fIdx} style={{ marginBottom: 4 }}>
                            {isImage ? (
                              <View style={{ borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 3, backgroundColor: C.lightGray }}>
                                <Image src={file.url} style={{ width: 220, height: 140, objectFit: "contain" }} />
                                <Text style={{ fontSize: 6, color: C.gray, marginTop: 2 }}>{file.name}</Text>
                              </View>
                            ) : (
                              <View style={{ backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary, borderRadius: 3, padding: 3 }}>
                                <Text style={{ fontSize: 7, color: C.primary, fontWeight: "bold" }}>
                                  📎 Attached File: {file.name || `Attachment #${fIdx + 1}`}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Page>

      {/* ══ FORM 1 — FORTNIGHTLY MONITOR ════════════════════════════════════════ */}
      {form1.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Fortnightly Monitor" />
          {form1.map((item, idx) => {
            const tScore = form1Score(item.teacherForm);
            const oScore = form1Score(item.observerForm);
            return (
              <View key={`f1-${idx}`} style={s.recordBox} wrap={false}>
                <Text style={s.sectionHead}>Record {idx + 1}</Text>
                <View style={s.metaGrid}>
                  <MetaRow label="Teacher" value={item.teacherID?.name} />
                  <MetaRow label="Observer" value={item.userId?.name} />
                  <MetaRow label="Class / Section" value={`${item.className} / ${item.section}`} />
                  <MetaRow label="Date" value={fmt(item.date)} />
                </View>
                <ScoreRow boxes={[
                  { label: "Teacher Score", value: `${tScore.score} / ${tScore.total}` },
                  { label: "Observer Score", value: `${oScore.score} / ${oScore.total}` },
                ]} />
              </View>
            );
          })}
        </Page>
      )}

      {/* ══ FORM 2 — CLASSROOM WALKTHROUGH ══════════════════════════════════════ */}
      {form2.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Classroom Walkthrough" />
          {form2.map((item, idx) => (
            <View key={`f2-${idx}`} style={s.recordBox}>
              <View>
                <Text style={s.sectionHead}>Record {idx + 1}</Text>
                <View style={s.metaGrid}>
                  <MetaRow label="Teacher" value={item.grenralDetails?.NameoftheVisitingTeacher?.name} />
                  <MetaRow label="Observer" value={item.createdBy?.name} />
                  <MetaRow label="Class / Section" value={`${item.grenralDetails?.className} / ${item.grenralDetails?.Section}`} />
                  <MetaRow label="Subject" value={item.grenralDetails?.Subject} />
                  <MetaRow label="Date" value={fmt(item.grenralDetails?.DateOfObservation)} />
                </View>
                <ScoreRow boxes={[
                  { label: "Observer Score", value: `${item.totalScores} / ${item.scoreOutof}` },
                ]} />
              </View>
              {item.ObserverFeedback?.length > 0 && (
                <View>
                  <Text style={s.sectionSubHead}>Observer Feedback</Text>
                  {item.ObserverFeedback.map((f, fi) => (
                    <View key={fi} style={s.qBox}>
                      <Text style={s.qLabel}>{f.question}</Text>
                      <Text style={s.qAnswer}>{f.answer}</Text>
                    </View>
                  ))}
                </View>
              )}
              {item.TeacherFeedback?.length > 0 && (
                <View>
                  <Text style={s.sectionSubHead}>Teacher Feedback</Text>
                  {item.TeacherFeedback.map((f, fi) => (
                    <View key={fi} style={s.qBox}>
                      <Text style={s.qLabel}>{f.question}</Text>
                      <Text style={s.qAnswer}>{f.answer}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </Page>
      )}

      {/* ══ FORM 3 — NOTEBOOK CHECKING ═══════════════════════════════════════════ */}
      {form3.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Notebook Checking Proforma" />
          {form3.map((item, idx) => {
            const tScore = form3Score(item.TeacherForm);
            const oScore = form3Score(item.ObserverForm);
            return (
              <View key={`f3-${idx}`} style={s.recordBox}>
                <View>
                  <Text style={s.sectionHead}>Record {idx + 1}</Text>
                  <View style={s.metaGrid}>
                    <MetaRow label="Teacher" value={item.teacherID?.name ?? item.createdBy?.name} />
                    <MetaRow label="Observer" value={item.grenralDetails?.NameofObserver?.name ?? item.createdBy?.name} />
                    <MetaRow label="Class / Section" value={`${item.grenralDetails?.className} / ${item.grenralDetails?.Section}`} />
                    <MetaRow label="Subject" value={item.grenralDetails?.Subject} />
                    <MetaRow label="Date" value={fmt(item.grenralDetails?.DateOfObservation)} />
                  </View>
                  <ScoreRow boxes={[
                    { label: "Teacher Score", value: `${tScore.score} / ${tScore.total}` },
                    { label: "Observer Score", value: `${oScore.score} / ${oScore.total}` },
                  ]} />
                </View>
                {item.observerFeedback && (
                  <View>
                    <Text style={s.sectionSubHead}>Observer Feedback</Text>
                    <View style={s.qBox}>
                      <Text style={s.qAnswer}>{item.observerFeedback}</Text>
                    </View>
                  </View>
                )}
                {item.teacherReflationFeedback && (
                  <View>
                    <Text style={s.sectionSubHead}>Teacher Reflection</Text>
                    <View style={s.qBox}>
                      <Text style={s.qAnswer}>{item.teacherReflationFeedback}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </Page>
      )}

      {/* ══ FORM 5 — CO-SCHOLASTIC CLASSROOM OBSERVATION ════════════════════════ */}
      {form5.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Co-Scholastic Classroom Observation" />
          {form5.map((item, idx) => (
            <View key={`f5-${idx}`} style={s.recordBox}>
              <Text style={s.sectionHead}>Record {idx + 1}</Text>
              <View style={s.metaGrid}>
                <MetaRow label="Teacher" value={item.grenralDetails?.NameoftheVisitingTeacher?.name ?? item.createdBy?.name} />
                <MetaRow label="Observer" value={item.createdBy?.name} />
                <MetaRow label="Class / Section" value={`${item.grenralDetails?.className} / ${item.grenralDetails?.Section}`} />
                <MetaRow label="Subject" value={item.grenralDetails?.Subject} />
                <MetaRow label="Date" value={fmt(item.grenralDetails?.DateOfObservation)} />
              </View>
              <ScoreRow boxes={[
                { label: "Observer Score", value: item.percentageScore ? `${item.percentageScore}%` : "—" },
              ]} />
            </View>
          ))}
        </Page>
      )}

      {/* ══ FORM 4 — LEARNING PROGRESS CHECKLIST ════════════════════════════════ */}
      {form4.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Learning Progress Checklist" />
          <Text style={s.sectionHead}>Learning Progress Checklist ({form4.length} records)</Text>
          <View style={s.table}>
            <View style={s.tableRow} wrap={false}>
              <View style={[s.th, s.col50]}><Text>Teacher</Text></View>
              <View style={[s.thLast, s.col50Last]}><Text>Date</Text></View>
            </View>
            {form4.map((f, i, arr) => (
              <View key={i} style={i === arr.length - 1 ? s.tableRowLast : s.tableRow} wrap={false}>
                <View style={[s.td, s.col50]}><Text>{f.teacherId?.name ?? f.userId?.name ?? "—"}</Text></View>
                <View style={[s.tdLast, s.col50Last]}><Text>{fmt(f.createdAt)}</Text></View>
              </View>
            ))}
          </View>
        </Page>
      )}

    </Document>
  );
};

export default WingCoordinatorDoc;
