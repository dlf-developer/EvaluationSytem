import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import Logo from "../Imgs/Logo.png";
import LogoBanner from "../Imgs/image.png";
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
  danger: "#DC2626",
  success: "#16A34A",
};

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: PDF_FONT, fontSize: 9, padding: 18 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  logo: { width: 40, height: 48 },
  logoBanner: { width: 150, height: 38, marginLeft: 10 },
  reportTitle: { fontSize: 11, fontWeight: 600, color: C.primary, textAlign: "center", marginBottom: 2 },

  // Meta
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8, marginTop: 3 },
  metaItem: { width: "50%", paddingVertical: 2, paddingHorizontal: 3 },
  metaLabel: { fontSize: 6, color: C.gray, marginBottom: 1, textTransform: "uppercase" },
  metaValue: { fontSize: 8, fontWeight: 600, color: C.text },

  // Section heading
  sectionHead: { backgroundColor: C.primary, color: C.white, padding: 4, fontSize: 9, fontWeight: 600, marginTop: 6, marginBottom: 3 },
  sectionSubHead: { backgroundColor: C.primaryLight, color: C.primary, padding: 3, fontSize: 8, fontWeight: 600, marginTop: 4, marginBottom: 2 },

  // Table
  table: { borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowLast: { flexDirection: "row" },
  th: { backgroundColor: C.lightGray, padding: 3, fontWeight: 600, fontSize: 6, color: C.text, borderRightWidth: 1, borderRightColor: C.border },
  td: { padding: 3, fontSize: 6, color: C.text, borderRightWidth: 1, borderRightColor: C.border },
  thLast: { backgroundColor: C.lightGray, padding: 3, fontWeight: 600, fontSize: 6, color: C.text },
  tdLast: { padding: 3, fontSize: 6, color: C.text },

  // Custom widths for Teacher Scores table
  colName: { width: "16%" },
  colScore: { width: "8.4%" },

  // Feedback
  qBox: { marginBottom: 4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.border },
  qLabel: { fontSize: 7, color: C.gray, marginBottom: 2, fontWeight: 600 },
  qAnswer: { fontSize: 8, color: C.text },

  // Signatures
  signatureContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: "30%", alignItems: "center" },
  signatureLine: { borderTopWidth: 1, borderTopColor: C.text, width: "100%", marginBottom: 4 },
  signatureText: { fontSize: 8, fontWeight: 600 },
});

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => getAllTimes(d)?.formattedDate2 ?? "—";

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

// ── MAIN DOCUMENT ─────────────────────────────────────────────────────────────
const AccountabilityDoc = ({ data }) => {
  if (!data)
    return (
      <Document>
        <Page size="A3" orientation="landscape" style={s.page}>
          <Text>Loading…</Text>
        </Page>
      </Document>
    );

  const {
    formName,
    fromDate,
    toDate,
    teacherScores = [],
    cpdHours = 0,
    fieldTrips = 0,
    excursions = 0,
    outdoorAct = 0,
    smilies = 0,
    contributionAchievement = "",
    overallRemarks = "",
    userId
  } = data;

  const dateRange = `${fmt(fromDate)} – ${fmt(toDate)}`;

  return (
    <Document>
      <Page size="A3" orientation="landscape" style={s.page}>
        <PageHeader title="Accountability Mechanism Report" />
        
        <View style={s.metaGrid}>
          <MetaRow label="Report Name" value={formName} />
          <MetaRow label="Date Range" value={dateRange} />
          <MetaRow label="Observer" value={userId?.name || "—"} />
        </View>

        {/* ── TEACHER SCORES ── */}
        <Text style={s.sectionHead}>Teacher Scores</Text>
        <View style={s.table}>
          <View style={s.tableRow}>
            <View style={[s.th, s.colName]}><Text>Teacher</Text></View>
            <View style={[s.th, s.colScore]}><Text>CW (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>NB (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>LP (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>QP (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>DA (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>MS (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>Annual (/10)</Text></View>
            <View style={[s.th, s.colScore]}><Text>Micro (/20)</Text></View>
            <View style={[s.th, s.colScore]}><Text>Total (/100)</Text></View>
            <View style={[s.thLast, s.colScore]}><Text>Percent</Text></View>
          </View>
          {teacherScores.map((ts, idx, arr) => {
            let total = (ts.classroomWalkthroughAvg || 0) + (ts.notebookCheckingAvg || 0);
            let maxMarks = 10 + 10;

            if (!ts.lessonPlanScore_na) { total += ts.lessonPlanScore || 0; maxMarks += 10; }
            if (!ts.qualityOfQPScore_na) { total += ts.qualityOfQPScore || 0; maxMarks += 10; }

            const daNA = ts.daAverage_na;
            if (!daNA) { total += ts.daAverage || 0; maxMarks += 10; }

            if (!ts.mindspark_na) { total += ts.mindspark || 0; maxMarks += 10; }

            const annualNA = ts.sec1_na && ts.sec2_na && ts.sec3_na && ts.sec4_na;
            if (!annualNA) { total += ts.annualReducedTo10 || 0; maxMarks += 10; }

            if (!ts.microTeaching_na) { total += ts.microTeaching || 0; maxMarks += 20; }

            const calculatedTotal = parseFloat(total.toFixed(2));
            const calculatedPct = maxMarks > 0 ? parseFloat(((total / maxMarks) * 100).toFixed(2)) : 0;

            return (
              <View key={idx} style={idx === arr.length - 1 ? s.tableRowLast : s.tableRow}>
                <View style={[s.td, s.colName]}><Text>{ts.teacherName}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.classroomWalkthroughAvg || 0}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.notebookCheckingAvg || 0}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.lessonPlanScore_na ? "N/A" : (ts.lessonPlanScore || 0)}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.qualityOfQPScore_na ? "N/A" : (ts.qualityOfQPScore || 0)}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{daNA ? "N/A" : (ts.daAverage || 0)}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.mindspark_na ? "N/A" : (ts.mindspark || 0)}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{annualNA ? "N/A" : (ts.annualReducedTo10 || 0)}</Text></View>
                <View style={[s.td, s.colScore]}><Text>{ts.microTeaching_na ? "N/A" : (ts.microTeaching || 0)}</Text></View>
                <View style={[s.td, s.colScore]}>
                  <Text style={{ color: calculatedPct < 50 ? C.danger : C.success, fontWeight: 600 }}>
                    {calculatedTotal}
                  </Text>
                </View>
                <View style={[s.tdLast, s.colScore]}><Text>{calculatedPct}%</Text></View>
              </View>
            );
          })}
          {teacherScores.length === 0 && (
            <View style={s.tableRowLast}>
              <View style={[s.tdLast, { width: "100%", textAlign: "center" }]}><Text>No teacher scores available</Text></View>
            </View>
          )}
        </View>

        {/* ── ADDITIONAL INFORMATION ── */}
        <Text style={s.sectionHead}>Additional Information</Text>
        <View style={s.table}>
          <View style={s.tableRow}>
            <View style={[s.th, { width: "25%" }]}><Text>Teacher</Text></View>
            <View style={[s.th, { width: "15%" }]}><Text>CPD (Hours)</Text></View>
            <View style={[s.th, { width: "15%" }]}><Text>Field Trips</Text></View>
            <View style={[s.th, { width: "15%" }]}><Text>Excursions</Text></View>
            <View style={[s.th, { width: "15%" }]}><Text>Outdoor Act</Text></View>
            <View style={[s.thLast, { width: "15%" }]}><Text>Smilies</Text></View>
          </View>
          {teacherScores.map((ts, idx, arr) => (
            <View key={idx} style={idx === arr.length - 1 ? s.tableRowLast : s.tableRow}>
              <View style={[s.td, { width: "25%" }]}><Text>{ts.teacherName}</Text></View>
              <View style={[s.td, { width: "15%" }]}><Text>{ts.cpdHours ?? cpdHours ?? 0}</Text></View>
              <View style={[s.td, { width: "15%" }]}><Text>{ts.fieldTrips ?? fieldTrips ?? 0}</Text></View>
              <View style={[s.td, { width: "15%" }]}><Text>{ts.excursions ?? excursions ?? 0}</Text></View>
              <View style={[s.td, { width: "15%" }]}><Text>{ts.outdoorAct ?? outdoorAct ?? 0}</Text></View>
              <View style={[s.tdLast, { width: "15%" }]}><Text>{ts.smilies ?? smilies ?? 0}</Text></View>
            </View>
          ))}
          {teacherScores.length === 0 && (
            <View style={s.tableRowLast}>
              <View style={[s.tdLast, { width: "100%", textAlign: "center" }]}><Text>No additional information available</Text></View>
            </View>
          )}
        </View>

        {/* ── REMARKS ── */}
        <Text style={s.sectionHead}>Remarks</Text>
        {teacherScores.map((ts, idx) => (
          <View key={idx} style={{ marginBottom: 6 }}>
            <Text style={s.sectionSubHead}>Teacher: {ts.teacherName}</Text>
            <View style={s.qBox}>
              <Text style={s.qLabel}>Contribution / Achievement</Text>
              <Text style={s.qAnswer}>{ts.contributionAchievement || contributionAchievement || "N/A"}</Text>
            </View>
            <View style={s.qBox}>
              <Text style={s.qLabel}>Overall Remarks</Text>
              <Text style={s.qAnswer}>{ts.overallRemarks || overallRemarks || "N/A"}</Text>
            </View>
          </View>
        ))}
        {teacherScores.length === 0 && (
          <View style={s.qBox}>
            <Text style={s.qAnswer}>No remarks available</Text>
          </View>
        )}

        {/* ── SIGNATURES ── */}
        <View style={s.signatureContainer}>
          <View style={s.signatureBox}>
            <View style={s.signatureLine}></View>
            <Text style={s.signatureText}>{userId?.name || "Observer"}</Text>
          </View>
          <View style={s.signatureBox}>
            <View style={s.signatureLine}></View>
            <Text style={s.signatureText}>Principal / Head</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default AccountabilityDoc;
