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
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../../Components/normalData";
import { calculateScorenew } from "../../../Utils/calculateScore";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    justifyContent: "flex-start",
  },
  container: {
    borderWidth: 1,
    margin: 20,
    padding: 20,
    paddingTop: 0,
    width: "100%",
  },
  headerSection: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 100, height: 120 },
  logoBanner: { width: 300, height: 80 },
  title: {
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 5,
    fontFamily: "Open Sans",
    fontSize: 12,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  colQuestion: { width: "60%", borderRightWidth: 1, padding: 5 },
  colTeacher: { width: "20%", borderRightWidth: 1, padding: 5 },
  colObserver: { width: "20%", borderRightWidth: 1, padding: 5 },
  headerText: {
    fontFamily: "Open Sans",
    fontWeight: 600,
    fontSize: 11,
    textAlign: "center",
  },
  cellText: {
    fontFamily: "Open Sans",
    fontSize: 11,
    textAlign: "center",
  },
  cellTextLeft: {
    fontFamily: "Open Sans",
    fontSize: 11,
  },
  pageNumber: {
    fontFamily: "Open Sans",
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
    color: "#666",
  },
});

// ── Score helpers ─────────────────────────────────────

// ── Reusable row ──────────────────────────────────────
const TableRow = ({ label, teacherVal, observerVal, isLast = false }) => (
  <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.colQuestion}>
      <Text style={styles.cellTextLeft}>{label}</Text>
    </View>
    <View style={styles.colTeacher}>
      <Text style={styles.cellText}>{teacherVal ?? "-"}</Text>
    </View>
    <View style={styles.colObserver}>
      <Text style={styles.cellText}>{observerVal ?? "-"}</Text>
    </View>
  </View>
);

// ── Reusable page header ──────────────────────────────
const PageHeader = ({ title, pageNum, totalPages }) => (
  <>
    <View style={styles.headerSection}>
      <Image src={Logo} style={styles.logo} />
      <Image src={LogoBanner} style={styles.logoBanner} />
    </View>
    <View style={styles.title}>
      <Text>{title}</Text>
    </View>
    <Text style={styles.pageNumber}>
      Page {pageNum} of {totalPages}
    </Text>
  </>
);

// ── Column header row ─────────────────────────────────
const ColumnHeaders = () => (
  <View style={styles.row}>
    <View style={styles.colQuestion}>
      <Text style={styles.headerText}>Questions</Text>
    </View>
    <View style={styles.colTeacher}>
      <Text style={styles.headerText}>Teacher</Text>
    </View>
    <View style={styles.colObserver}>
      <Text style={styles.headerText}>Observer</Text>
    </View>
  </View>
);

const QUESTIONS_PER_PAGE = 18;

// ── Main document ─────────────────────────────────────
const MyDocument = ({ data }) => {
  const activeQuestions =
    new Date(data?.createdAt) < new Date(cutoffDate) ? questionsOld : questions;

  const teacher = data?.teacherForm;
  const observer = data?.observerForm;

  const teacherScores = calculateScorenew(teacher, activeQuestions);
  const observerScores = calculateScorenew(observer, activeQuestions);

  const className =
    typeof data?.className === "object" ? data.className.name : data?.className;
  const classSection = `${className ?? ""}/${data?.section ?? ""}`;
  const formattedDate = getAllTimes(data?.date)?.formattedDate2 ?? "-";

  // Split questions into chunks of 20
  const page1Questions = activeQuestions.slice(0, QUESTIONS_PER_PAGE);
  const page2Questions = activeQuestions.slice(QUESTIONS_PER_PAGE);
  const totalPages = page2Questions.length > 0 ? 2 : 1;

  return (
    <Document>
      {/* ── PAGE 1 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <PageHeader
            title="Fortnightly Monitor"
            pageNum={1}
            totalPages={totalPages}
          />
          <View style={styles.table}>
            <ColumnHeaders />

            {/* Class & Section + Date only on page 1 */}
            <TableRow
              label="Class & Section"
              teacherVal={classSection}
              observerVal={classSection}
            />
            <TableRow
              label="Date"
              teacherVal={formattedDate}
              observerVal={formattedDate}
            />

            {/* First 20 questions */}
            {page1Questions.map((item, index) => (
              <TableRow
                key={index}
                label={item.name}
                teacherVal={teacher?.[item.key] || "-"}
                observerVal={observer?.[item.key] || "-"}
                // If no page 2, show scores at end of page 1
                isLast={totalPages === 1 && index === page1Questions.length - 1}
              />
            ))}

            {/* If only 1 page, show scores here */}
            {totalPages === 1 && (
              <>
                <TableRow
                  label="Total Score"
                  teacherVal={String(teacherScores.score)}
                  observerVal={String(observerScores.score)}
                />
                <TableRow
                  label="Out of"
                  teacherVal={String(teacherScores.total)}
                  observerVal={String(observerScores.total)}
                  isLast
                />
              </>
            )}
          </View>
        </View>
      </Page>

      {/* ── PAGE 2 (only if there are remaining questions) ── */}
      {page2Questions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <PageHeader
              title="Fortnightly Monitor (Continued)"
              pageNum={2}
              totalPages={totalPages}
            />
            <View style={styles.table}>
              <ColumnHeaders />

              {/* Remaining questions */}
              {page2Questions.map((item, index) => (
                <TableRow
                  key={index}
                  label={item.name}
                  teacherVal={teacher?.[item.key] || "-"}
                  observerVal={observer?.[item.key] || "-"}
                />
              ))}

              {/* Total Score & Out of always at end of last page */}
              <TableRow
                label="Total Score"
                teacherVal={String(teacherScores.score)}
                observerVal={String(observerScores.score)}
              />
              <TableRow
                label="Out of"
                teacherVal={String(teacherScores.total)}
                observerVal={String(observerScores.total)}
                isLast
              />
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default MyDocument;
