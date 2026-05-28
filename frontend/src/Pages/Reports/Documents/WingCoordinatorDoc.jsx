import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import Logo from "../Imgs/Logo.png";
import LogoBanner from "../Imgs/image.png";
import { getAllTimes } from "../../../Utils/auth";

Font.register({
  family: "Open Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf", fontWeight: 600 },
  ],
});

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
  page: { backgroundColor: C.white, fontFamily: "Open Sans", fontSize: 9, padding: 18 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  logo: { width: 40, height: 48 },
  logoBanner: { width: 150, height: 38, marginLeft: 10 },
  reportTitle: { fontSize: 11, fontWeight: 600, color: C.primary, textAlign: "center", marginBottom: 2 },
  pageNum: { fontSize: 7, color: C.gray, textAlign: "right", marginBottom: 4 },

  // Meta
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4, marginTop: 3 },
  metaItem: { width: "33%", paddingVertical: 2, paddingHorizontal: 3 },
  metaLabel: { fontSize: 6, color: C.gray, marginBottom: 1, textTransform: "uppercase" },
  metaValue: { fontSize: 8, fontWeight: 600, color: C.text },

  // Section heading
  sectionHead: { backgroundColor: C.primary, color: C.white, padding: 4, fontSize: 9, fontWeight: 600, marginTop: 6, marginBottom: 3 },
  sectionSubHead: { backgroundColor: C.primaryLight, color: C.primary, padding: 3, fontSize: 8, fontWeight: 600, marginTop: 4, marginBottom: 2 },

  // Table
  table: { borderWidth: 1, borderColor: C.border },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowLast: { flexDirection: "row" },
  th: { backgroundColor: C.lightGray, padding: 3, fontWeight: 600, fontSize: 7, color: C.text },
  td: { padding: 3, fontSize: 7, color: C.text },
  col50: { width: "50%", borderRightWidth: 1, borderRightColor: C.border },
  col50Last: { width: "50%" },
  col40: { width: "40%", borderRightWidth: 1, borderRightColor: C.border },
  col30: { width: "30%", borderRightWidth: 1, borderRightColor: C.border },

  // Score row
  scoreRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 3, marginBottom: 3 },
  scoreBox: { backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary, borderRadius: 3, padding: 3, marginLeft: 4, alignItems: "center", minWidth: 55 },
  scoreLabel: { fontSize: 6, color: C.gray, marginBottom: 1 },
  scoreValue: { fontSize: 9, fontWeight: 600, color: C.primary },

  // Feedback
  qBox: { marginBottom: 4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.border },
  qLabel: { fontSize: 7, color: C.gray, marginBottom: 2 },
  qAnswer: { fontSize: 8, color: C.text },

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

// ── Sub-components (NO fragments) ─────────────────────────────────────────────
const PageHeader = ({ title }) => (
  <View>
    <View style={s.header}>
      <Image src={Logo} style={s.logo} />
      <Image src={LogoBanner} style={s.logoBanner} />
    </View>
    <Text style={s.reportTitle}>{title}</Text>
  </View>
);

const MetaRow = ({ label, value }) => (
  <View style={s.metaItem}>
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
    monthlyReport = [],
    range,
    className,
  } = data;

  const dateRange = range?.length === 2 ? `${fmt(range[0])} – ${fmt(range[1])}` : "—";
  const classes = Array.isArray(className) ? className.join(", ") : (className ?? "—");

  return (
    <Document>

      {/* ══ COVER PAGE ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Wing Coordinator Report" />
        <Text style={[s.qLabel, { textAlign: "center", marginBottom: 16 }]}>
          {dateRange}  |  {classes}
        </Text>

        {/* Summary table */}
        <Text style={s.sectionHead}>Report Summary</Text>
        <View style={s.table}>
          <View style={s.tableRow}>
            <View style={[s.th, s.col50]}><Text>Section</Text></View>
            <View style={[s.th, s.col50Last]}><Text>Records</Text></View>
          </View>
          {[
            ["Fortnightly Monitor (Form 1)", form1.length],
            ["Classroom Walkthrough (Form 2)", form2.length],
            ["Notebook Checking Proforma (Form 3)", form3.length],
            ["Learning Progress Checklist (Form 4)", form4.length],
          ].map(([label, count], i, arr) => (
            <View key={label} style={i === arr.length - 1 ? s.tableRowLast : s.tableRow}>
              <View style={[s.td, s.col50]}><Text>{label}</Text></View>
              <View style={[s.td, s.col50Last]}><Text>{count}</Text></View>
            </View>
          ))}
        </View>

        {/* Monthly report */}
        {monthlyReport.length > 0 && (
          <View>
            <Text style={s.sectionHead}>Monthly Report</Text>
            {monthlyReport.map((item, i) => (
              <View key={i} style={s.qBox}>
                <Text style={s.qLabel}>{item.question}</Text>
                {item.type === "text" ? (
                  <Text style={s.qAnswer}>{item.answer || "—"}</Text>
                ) : (
                  <View style={[s.table, { marginTop: 4 }]}>
                    {item.tableData?.length > 0 ? (
                      <View>
                        <View style={s.tableRow}>
                          {(item.columns || []).map((col, cIdx, arr) => (
                            <View key={cIdx} style={[s.th, cIdx === arr.length - 1 ? { flex: 1 } : { flex: 1, borderRightWidth: 1, borderRightColor: C.border }]}>
                              <Text>{col}</Text>
                            </View>
                          ))}
                        </View>
                        {item.tableData.map((row, rIdx, rArr) => (
                          <View key={rIdx} style={rIdx === rArr.length - 1 ? s.tableRowLast : s.tableRow}>
                            {(item.columns || []).map((col, cIdx, cArr) => (
                              <View key={cIdx} style={[s.td, cIdx === cArr.length - 1 ? { flex: 1 } : { flex: 1, borderRightWidth: 1, borderRightColor: C.border }]}>
                                <Text>{row[`col_${cIdx}`] || "—"}</Text>
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={s.td}>No data</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
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
            <View key={`f2-${idx}`} style={s.recordBox} wrap={false}>
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
              <View key={`f3-${idx}`} style={s.recordBox} wrap={false}>
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

      {/* ══ FORM 4 — LEARNING PROGRESS CHECKLIST ════════════════════════════════ */}
      {form4.length > 0 && (
        <Page size="A4" style={s.page}>
          <PageHeader title="Learning Progress Checklist" />
          <Text style={s.sectionHead}>Learning Progress Checklist ({form4.length} records)</Text>
          <View style={s.table}>
            <View style={s.tableRow}>
              <View style={[s.th, s.col50]}><Text>Teacher</Text></View>
              <View style={[s.th, s.col50Last]}><Text>Date</Text></View>
            </View>
            {form4.map((f, i) => (
              <View key={i} style={i === form4.length - 1 ? s.tableRowLast : s.tableRow}>
                <View style={[s.td, s.col50]}><Text>{f.teacherId?.name ?? f.userId?.name ?? "—"}</Text></View>
                <View style={[s.td, s.col50Last]}><Text>{fmt(f.createdAt)}</Text></View>
              </View>
            ))}
          </View>
        </Page>
      )}

    </Document>
  );
};

export default WingCoordinatorDoc;
