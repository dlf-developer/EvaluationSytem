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
  danger: "#DC2626",
  success: "#16A34A",
};

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Open Sans", fontSize: 9, padding: 18 },

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
          {teacherScores.map((ts, idx, arr) => (
            <View key={idx} style={idx === arr.length - 1 ? s.tableRowLast : s.tableRow}>
              <View style={[s.td, s.colName]}><Text>{ts.teacherName}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.classroomWalkthroughAvg || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.notebookCheckingAvg || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.lessonPlanScore || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.qualityOfQPScore || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.daAverage || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.mindspark || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.annualReducedTo10 || 0}</Text></View>
              <View style={[s.td, s.colScore]}><Text>{ts.microTeaching || 0}</Text></View>
              <View style={[s.td, s.colScore]}>
                <Text style={{ color: ts.totalScore < 50 ? C.danger : C.success, fontWeight: 600 }}>
                  {ts.totalScore || 0}
                </Text>
              </View>
              <View style={[s.tdLast, s.colScore]}><Text>{ts.percentage || 0}%</Text></View>
            </View>
          ))}
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
            <View style={[s.th, { width: "20%" }]}><Text>CPD (Hours)</Text></View>
            <View style={[s.th, { width: "20%" }]}><Text>Field Trips</Text></View>
            <View style={[s.th, { width: "20%" }]}><Text>Excursions</Text></View>
            <View style={[s.th, { width: "20%" }]}><Text>Outdoor Activities</Text></View>
            <View style={[s.thLast, { width: "20%" }]}><Text>Smilies</Text></View>
          </View>
          <View style={s.tableRowLast}>
            <View style={[s.td, { width: "20%" }]}><Text>{cpdHours}</Text></View>
            <View style={[s.td, { width: "20%" }]}><Text>{fieldTrips}</Text></View>
            <View style={[s.td, { width: "20%" }]}><Text>{excursions}</Text></View>
            <View style={[s.td, { width: "20%" }]}><Text>{outdoorAct}</Text></View>
            <View style={[s.tdLast, { width: "20%" }]}><Text>{smilies}</Text></View>
          </View>
        </View>

        {/* ── REMARKS ── */}
        <Text style={s.sectionHead}>Remarks</Text>
        <View style={s.qBox}>
          <Text style={s.qLabel}>Contribution / Achievement</Text>
          <Text style={s.qAnswer}>{contributionAchievement || "N/A"}</Text>
        </View>
        <View style={s.qBox}>
          <Text style={s.qLabel}>Overall Remarks</Text>
          <Text style={s.qAnswer}>{overallRemarks || "N/A"}</Text>
        </View>

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
