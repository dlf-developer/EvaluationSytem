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
  secondary: "#2D3E27",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  border: "#D1D5DB",
  white: "#FFFFFF",
  text: "#2D2A26",
  badge: { Yes: "#D1FAE5", No: "#FEE2E2", Sometimes: "#FEF3C7", "N/A": "#E5E7EB" },
  badgeText: { Yes: "#065F46", No: "#991B1B", Sometimes: "#92400E", "N/A": "#6B7280" },
};

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Open Sans", fontSize: 10, padding: 30 },
  container: { margin: 0, padding: 0 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  logo: { width: 70, height: 84 },
  logoBanner: { width: 230, height: 60, marginLeft: 20 },
  reportTitle: { fontSize: 16, fontWeight: 600, color: C.primary, textAlign: "center", marginBottom: 6 },
  subTitle: { fontSize: 10, color: C.gray, textAlign: "center", marginBottom: 12 },
  pageNum: { fontSize: 8, color: C.gray, textAlign: "right", marginTop: 4 },

  // Meta grid
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  metaItem: { width: "33%", paddingVertical: 4, paddingHorizontal: 6 },
  metaLabel: { fontSize: 8, color: C.gray, marginBottom: 2 },
  metaValue: { fontSize: 10, fontWeight: 600, color: C.text },

  // Section heading
  sectionHead: { backgroundColor: C.primary, color: C.white, padding: 8, fontSize: 11, fontWeight: 600, marginTop: 16, marginBottom: 0 },
  sectionSubHead: { backgroundColor: C.primaryLight, color: C.primary, padding: 6, fontSize: 9, fontWeight: 600, marginTop: 10, marginBottom: 0 },

  // Table
  table: { borderWidth: 1, borderColor: C.border },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowLast: { flexDirection: "row" },
  th: { backgroundColor: C.lightGray, padding: 6, fontWeight: 600, fontSize: 9, color: C.text },
  td: { padding: 6, fontSize: 9, color: C.text },
  col60: { width: "60%", borderRightWidth: 1, borderRightColor: C.border },
  col20: { width: "20%", borderRightWidth: 1, borderRightColor: C.border },
  col20Last: { width: "20%" },
  col40: { width: "40%", borderRightWidth: 1, borderRightColor: C.border },
  col30: { width: "30%", borderRightWidth: 1, borderRightColor: C.border },
  col25: { width: "25%", borderRightWidth: 1, borderRightColor: C.border },
  col25Last: { width: "25%" },
  col100: { width: "100%" },
  col50: { width: "50%", borderRightWidth: 1, borderRightColor: C.border },
  col50Last: { width: "50%" },
  colAns: { width: "15%", borderRightWidth: 1, borderRightColor: C.border, alignItems: "center" },
  colAnsLast: { width: "15%", alignItems: "center" },

  // Badge
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, textAlign: "center" },

  // Score row
  scoreRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, marginBottom: 8 },
  scoreBox: { backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary, borderRadius: 4, padding: 8, marginLeft: 8, alignItems: "center", minWidth: 80 },
  scoreLabel: { fontSize: 8, color: C.gray, marginBottom: 2 },
  scoreValue: { fontSize: 12, fontWeight: 600, color: C.primary },

  // Monthly report
  qBox: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  qLabel: { fontSize: 9, color: C.gray, marginBottom: 4 },
  qAnswer: { fontSize: 10, color: C.text },
  qRemarks: { fontSize: 9, color: C.primary, marginTop: 4 },
});

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => getAllTimes(d)?.formattedDate2 ?? "—";

const BadgeText = ({ val }) => {
  const bg = C.badge[val] ?? "#E5E7EB";
  const color = C.badgeText[val] ?? "#374151";
  return <Text style={[s.badge, { backgroundColor: bg, color }]}>{val || "—"}</Text>;
};

const PageHeader = ({ title, sub, n, total }) => (
  <>
    <View style={s.header}>
      <Image src={Logo} style={s.logo} />
      <Image src={LogoBanner} style={s.logoBanner} />
    </View>
    <Text style={s.reportTitle}>{title}</Text>
    {sub ? <Text style={s.subTitle}>{sub}</Text> : null}
    <Text style={s.pageNum}>Page {n} of {total}</Text>
  </>
);

// score for form1
const form1Score = (form) => {
  if (!form) return { score: 0, total: 0 };
  const vals = Object.values(form).filter(v => ["Yes","No","Sometimes","N/A"].includes(v));
  const score = Object.values(form).reduce((s, v) => s + (v === "Yes" ? 1 : v === "Sometimes" ? 0.5 : 0), 0);
  return { score, total: vals.length };
};

// score for form2
const form2Score = (sections) => {
  let score = 0, total = 0;
  (sections || []).forEach(item => {
    if (["1","2","3","4"].includes(item.answer)) {
      score += parseInt(item.answer);
      total += 4;
    } else if (item.answer !== "N/A") {
      total += 4;
    }
  });
  return { score, total };
};

// ── MAIN DOCUMENT ─────────────────────────────────────────────────────────────
const WingCoordinatorDoc = ({ data }) => {
  if (!data) return <Document><Page size="A4"><Text>Loading…</Text></Page></Document>;

  const { form1 = [], form2 = [], form3 = [], form4 = [], monthlyReport = [], range, className } = data;
  const dateRange = range?.length === 2 ? `${fmt(range[0])} – ${fmt(range[1])}` : "—";
  const classes = Array.isArray(className) ? className.join(", ") : className ?? "—";

  // helpers for form2 sections
  const f2Sections = ["essentialAggrements", "planingAndPreparation", "classRoomEnvironment", "instruction"];

  return (
    <Document>
      {/* ══════════════ PAGE 1 — COVER / SUMMARY ══════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.container}>
          <PageHeader title="Wing Coordinator Analysis Report" sub={`Date Range: ${dateRange}  |  Classes: ${classes}`} n={1} total={1 + form1.length + form2.length + (form3.length > 0 ? 1 : 0) + (form4.length > 0 ? 1 : 0) + (monthlyReport.length > 0 ? 1 : 0)} />

          {/* Summary table */}
          <Text style={s.sectionHead}>Report Summary</Text>
          <View style={s.table}>
            <View style={s.tableRow}>
              <View style={[s.th, s.col50]}><Text>Section</Text></View>
              <View style={[s.th, s.col50Last]}><Text>Records Selected</Text></View>
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

          {/* Monthly report preview */}
          {monthlyReport?.length > 0 && (
            <>
              <Text style={s.sectionHead}>Monthly Report</Text>
              {monthlyReport.map((item, i) => (
                <View key={i} style={s.qBox}>
                  <Text style={s.qLabel}>{item.question}</Text>
                  <Text style={s.qAnswer}>{item.answer || "—"}</Text>
                  {item.remarks && (
                    <Text style={s.qRemarks}><Text style={{fontWeight: 600}}>Remarks: </Text>{item.remarks}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </Page>

      {/* ══════════════ FORM 1 — FORTNIGHTLY MONITOR ══════════════ */}
      {form1.map((item, idx) => {
        const tScore = form1Score(item.teacherForm);
        const oScore = form1Score(item.observerForm);
        const keys = item.teacherForm ? Object.keys(item.teacherForm).filter(k => !["totalScore","OutOf","ObservationDates"].includes(k)) : [];
        return (
          <Page key={`f1-${idx}`} size="A4" style={s.page}>
            <View style={s.container}>
              <PageHeader title={`Fortnightly Monitor — Record ${idx + 1}`} n={2 + idx} total="—" />
              {/* meta */}
              <View style={s.metaGrid}>
                <View style={s.metaItem}><Text style={s.metaLabel}>Teacher</Text><Text style={s.metaValue}>{item.teacherID?.name ?? "—"}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLabel}>Observer</Text><Text style={s.metaValue}>{item.userId?.name ?? "—"}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLabel}>Class / Section</Text><Text style={s.metaValue}>{item.className} / {item.section}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLabel}>Date</Text><Text style={s.metaValue}>{fmt(item.date)}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLabel}>Teacher Submitted</Text><Text style={s.metaValue}>{fmt(item.TeacherSubmissionDate)}</Text></View>
                <View style={s.metaItem}><Text style={s.metaLabel}>Observer Submitted</Text><Text style={s.metaValue}>{fmt(item.ObserverSubmissionDate)}</Text></View>
              </View>
              {/* table */}
              <View style={s.table}>
                <View style={s.tableRow}>
                  <View style={[s.th, s.col60]}><Text>Question</Text></View>
                  <View style={[s.th, s.col20]}><Text style={{textAlign:"center"}}>Teacher</Text></View>
                  <View style={[s.th, s.col20Last]}><Text style={{textAlign:"center"}}>Observer</Text></View>
                </View>
                {keys.map((key, ki) => (
                  <View key={key} style={ki === keys.length - 1 ? s.tableRowLast : s.tableRow}>
                    <View style={[s.td, s.col60]}>
                      <Text>{key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</Text>
                    </View>
                    <View style={[s.td, s.col20, {alignItems:"center"}]}>
                      <BadgeText val={item.teacherForm?.[key]} />
                    </View>
                    <View style={[s.td, s.col20Last, {alignItems:"center"}]}>
                      <BadgeText val={item.observerForm?.[key]} />
                    </View>
                  </View>
                ))}
              </View>
              {/* scores */}
              <View style={s.scoreRow}>
                <View style={s.scoreBox}><Text style={s.scoreLabel}>Teacher Score</Text><Text style={s.scoreValue}>{tScore.score} / {tScore.total}</Text></View>
                <View style={s.scoreBox}><Text style={s.scoreLabel}>Observer Score</Text><Text style={s.scoreValue}>{oScore.score} / {oScore.total}</Text></View>
              </View>
            </View>
          </Page>
        );
      })}

      {/* ══════════════ FORM 2 — CLASSROOM WALKTHROUGH ══════════════ */}
      {form2.map((item, idx) => (
        <Page key={`f2-${idx}`} size="A4" style={s.page}>
          <View style={s.container}>
            <PageHeader title={`Classroom Walkthrough — Record ${idx + 1}`} n={2 + form1.length + idx} total="—" />
            <View style={s.metaGrid}>
              <View style={s.metaItem}><Text style={s.metaLabel}>Teacher</Text><Text style={s.metaValue}>{item.grenralDetails?.NameoftheVisitingTeacher?.name ?? "—"}</Text></View>
              <View style={s.metaItem}><Text style={s.metaLabel}>Observer</Text><Text style={s.metaValue}>{item.createdBy?.name ?? "—"}</Text></View>
              <View style={s.metaItem}><Text style={s.metaLabel}>Class / Section</Text><Text style={s.metaValue}>{item.grenralDetails?.className} / {item.grenralDetails?.Section}</Text></View>
              <View style={s.metaItem}><Text style={s.metaLabel}>Subject</Text><Text style={s.metaValue}>{item.grenralDetails?.Subject ?? "—"}</Text></View>
              <View style={s.metaItem}><Text style={s.metaLabel}>Topic</Text><Text style={s.metaValue}>{item.grenralDetails?.Topic ?? "—"}</Text></View>
              <View style={s.metaItem}><Text style={s.metaLabel}>Date of Observation</Text><Text style={s.metaValue}>{fmt(item.grenralDetails?.DateOfObservation)}</Text></View>
            </View>

            {f2Sections.map((sec) => {
              const items = item[sec] || [];
              const { score, total } = form2Score(items);
              const label = sec === "essentialAggrements" ? "Essential Agreements"
                : sec === "planingAndPreparation" ? "Planning & Preparation"
                : sec === "classRoomEnvironment" ? "Classroom Environment"
                : "Instruction";
              return (
                <View key={sec}>
                  <Text style={s.sectionSubHead}>{label}  ({score}/{total})</Text>
                  <View style={s.table}>
                    <View style={s.tableRow}>
                      <View style={[s.th, s.col60]}><Text>Question</Text></View>
                      <View style={[s.th, s.col20Last, {width:"40%", textAlign:"center"}]}><Text>Score</Text></View>
                    </View>
                    {items.map((q, qi) => (
                      <View key={qi} style={qi === items.length - 1 ? s.tableRowLast : s.tableRow}>
                        <View style={[s.td, s.col60]}><Text>{q.question}</Text></View>
                        <View style={[s.td, {width:"40%", alignItems:"center"}]}>
                          <BadgeText val={q.answer} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* totals */}
            <View style={s.scoreRow}>
              <View style={s.scoreBox}><Text style={s.scoreLabel}>Total Score</Text><Text style={s.scoreValue}>{item.totalScores} / {item.scoreOutof}</Text></View>
              <View style={s.scoreBox}><Text style={s.scoreLabel}>Grade</Text><Text style={s.scoreValue}>{item.Grade ?? "—"}</Text></View>
              <View style={s.scoreBox}><Text style={s.scoreLabel}>%</Text><Text style={s.scoreValue}>{item.percentageScore}%</Text></View>
            </View>

            {/* feedback */}
            {item.ObserverFeedback?.length > 0 && (
              <>
                <Text style={s.sectionSubHead}>Observer Feedback</Text>
                {item.ObserverFeedback.map((f, fi) => (
                  <View key={fi} style={s.qBox}>
                    <Text style={s.qLabel}>{f.question}</Text>
                    <Text style={s.qAnswer}>{f.answer}</Text>
                  </View>
                ))}
              </>
            )}
            {item.TeacherFeedback?.length > 0 && (
              <>
                <Text style={s.sectionSubHead}>Teacher Feedback</Text>
                {item.TeacherFeedback.map((f, fi) => (
                  <View key={fi} style={s.qBox}>
                    <Text style={s.qLabel}>{f.question}</Text>
                    <Text style={s.qAnswer}>{f.answer}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </Page>
      ))}

      {/* ══════════════ FORM 3 — NOTEBOOK ══════════════ */}
      {form3.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.container}>
            <PageHeader title="Notebook Checking Proforma" n="—" total="—" />
            <Text style={s.sectionHead}>Notebook Checking Proforma ({form3.length} records)</Text>
            <View style={s.table}>
              <View style={s.tableRow}>
                <View style={[s.th, s.col40]}><Text>Teacher</Text></View>
                <View style={[s.th, s.col30]}><Text>Class</Text></View>
                <View style={[s.th, s.col20Last, {width:"30%"}]}><Text>Date</Text></View>
              </View>
              {form3.map((f, i) => (
                <View key={i} style={i === form3.length - 1 ? s.tableRowLast : s.tableRow}>
                  <View style={[s.td, s.col40]}><Text>{f.teacherID?.name ?? "—"}</Text></View>
                  <View style={[s.td, s.col30]}><Text>{f.grenralDetails?.className ?? "—"}</Text></View>
                  <View style={[s.td, {width:"30%"}]}><Text>{fmt(f.createdAt)}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* ══════════════ FORM 4 — WEEKLY CHECKLIST ══════════════ */}
      {form4.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.container}>
            <PageHeader title="Learning Progress Checklist" n="—" total="—" />
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
          </View>
        </Page>
      )}
    </Document>
  );
};

export default WingCoordinatorDoc;
