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
import { PDF_FONT } from "../pdfFonts";

const C = {
  primary: "#1a4d2e",
  primaryLight: "#e8f5e9",
  gray: "#6b7280",
  lightGray: "#f9fafb",
  border: "#d1d5db",
  white: "#ffffff",
  text: "#1f2937",
  success: "#15803d",
  warning: "#b45309",
};

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: PDF_FONT, fontSize: 8.5, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logo: { width: 44, height: 50 },
  logoBanner: { width: 140, height: 35 },
  reportTitle: { fontSize: 13, fontWeight: 700, color: C.primary, textAlign: "center", marginVertical: 3 },
  subTitle: { fontSize: 8, color: C.gray, textAlign: "center", marginBottom: 6 },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10, padding: 6, backgroundColor: C.lightGray, borderRadius: 4, borderWidth: 1, borderColor: C.border },
  metaItem: { width: "33.33%", paddingVertical: 2.5, paddingHorizontal: 4 },
  metaLabel: { fontSize: 6.5, color: C.gray, textTransform: "uppercase", fontWeight: 600, marginBottom: 1 },
  metaValue: { fontSize: 8, fontWeight: 700, color: C.text },

  sectionHead: {
    backgroundColor: C.primary,
    color: C.white,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontSize: 9,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 2,
  },
  sectionSubHead: {
    backgroundColor: C.primaryLight,
    color: C.primary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 3,
  },

  table: { borderWidth: 1, borderColor: C.border, marginBottom: 6, borderRadius: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, minHeight: 18, alignItems: "center" },
  tableRowLast: { flexDirection: "row", minHeight: 18, alignItems: "center" },
  thQuestion: { width: "85%", backgroundColor: C.lightGray, padding: 4, fontSize: 7.5, fontWeight: 700, color: C.text, borderRightWidth: 1, borderRightColor: C.border },
  thScore: { width: "15%", backgroundColor: C.lightGray, padding: 4, fontSize: 7.5, fontWeight: 700, color: C.text, textAlign: "center" },
  tdQuestion: { width: "85%", padding: 4, fontSize: 7.5, color: C.text, borderRightWidth: 1, borderRightColor: C.border },
  tdScore: { width: "15%", padding: 4, fontSize: 7.5, fontWeight: 700, color: C.primary, textAlign: "center" },

  qBox: { marginBottom: 6, padding: 6, backgroundColor: C.lightGray, borderRadius: 3, borderWidth: 1, borderColor: C.border },
  qLabel: { fontSize: 7.5, color: C.primary, fontWeight: 700, marginBottom: 2 },
  qValue: { fontSize: 7.5, color: C.text, lineHeight: 1.3 },

  footer: {
    position: "absolute",
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 4,
  },
  footerText: { fontSize: 6.5, color: C.gray },
});

const CoScholasticDoc = ({ data }) => {
  const g = data?.grenralDetails || {};
  const teacherName = g.NameoftheVisitingTeacher?.name || g.NameoftheVisitingTeacher || "—";
  const observerName = data?.createdBy?.name || "—";
  const obsDate = g.DateOfObservation ? getAllTimes(g.DateOfObservation)?.formattedDate2 : "—";

  const renderRubricSection = (title, items = []) => {
    if (!items || items.length === 0) return null;
    return (
      <View wrap={false} style={{ marginBottom: 4 }}>
        <Text style={s.sectionSubHead}>{title}</Text>
        <View style={s.table}>
          <View style={s.tableRow}>
            <Text style={s.thQuestion}>Parameter / Criterion</Text>
            <Text style={s.thScore}>Rating</Text>
          </View>
          {items.map((it, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <View key={idx} style={isLast ? s.tableRowLast : s.tableRow}>
                <Text style={s.tdQuestion}>{it.question || `Parameter ${idx + 1}`}</Text>
                <Text style={s.tdScore}>{it.answer || "—"}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document title={`Co-Scholastic-Report-${data?._id || "view"}`} author="DLF Evaluation System">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          {LOGO_BASE64 ? <Image src={LOGO_BASE64} style={s.logo} /> : <View style={s.logo} />}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={s.reportTitle}>CO-SCHOLASTIC CLASSROOM OBSERVATION</Text>
            <Text style={s.subTitle}>Comprehensive Teacher Evaluation & Reflection Report</Text>
          </View>
          {BANNER_BASE64 ? <Image src={BANNER_BASE64} style={s.logoBanner} /> : <View style={s.logoBanner} />}
        </View>

        {/* Metadata Grid */}
        <View style={s.metaGrid}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Visiting Teacher</Text>
            <Text style={s.metaValue}>{teacherName}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Observer</Text>
            <Text style={s.metaValue}>{observerName}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Date of Observation</Text>
            <Text style={s.metaValue}>{obsDate}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Class & Section</Text>
            <Text style={s.metaValue}>{g.className || "—"} - {g.Section || "—"}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Subject / Activity</Text>
            <Text style={s.metaValue}>{g.Subject || "—"}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Topic / Lesson</Text>
            <Text style={s.metaValue}>{g.Topic || "—"}</Text>
          </View>
          {data?.totalScores !== undefined && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Total Score</Text>
              <Text style={s.metaValue}>{data.totalScores} / {data.scoreOutof || 40}</Text>
            </View>
          )}
          {data?.percentageScore !== undefined && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Percentage</Text>
              <Text style={s.metaValue}>{data.percentageScore}%</Text>
            </View>
          )}
          {data?.Grade && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Grade</Text>
              <Text style={s.metaValue}>{data.Grade}</Text>
            </View>
          )}
        </View>

        {/* Rubrics */}
        <Text style={s.sectionHead}>OBSERVER EVALUATION CRITERIA</Text>
        {renderRubricSection("Classroom Management", data?.classroomManagement)}
        {renderRubricSection("Planning & Execution", data?.planningAndExecution)}
        {renderRubricSection("Student Engagement & Behavioral Climate", data?.studentEngagement)}
        {renderRubricSection("Instruction & Facilitation", data?.instructionAndFacilitation)}

        {/* Observer Feedback */}
        {data?.ObserverFeedback && data.ObserverFeedback.length > 0 && (
          <View wrap={false} style={{ marginTop: 6 }}>
            <Text style={s.sectionHead}>OBSERVER FEEDBACK NOTES</Text>
            {data.ObserverFeedback.map((fb, idx) => (
              <View key={idx} style={s.qBox}>
                <Text style={s.qLabel}>{fb.question || `Note #${idx + 1}`}</Text>
                <Text style={s.qValue}>{fb.answer || "No feedback provided."}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Teacher Reflection Section */}
        <View wrap={false} style={{ marginTop: 8 }}>
          <Text style={s.sectionHead}>TEACHER REFLECTION & KEY LEARNINGS</Text>
          {data?.isTeacherCompletes && data?.TeacherFeedback && data.TeacherFeedback.length > 0 ? (
            data.TeacherFeedback.map((tf, idx) => (
              <View key={idx} style={s.qBox}>
                <Text style={s.qLabel}>{tf.question || `Reflection Prompt #${idx + 1}`}</Text>
                <Text style={s.qValue}>{tf.answer || "—"}</Text>
              </View>
            ))
          ) : (
            <View style={s.qBox}>
              <Text style={[s.qValue, { fontStyle: "italic", color: C.gray }]}>
                {data?.isTeacherCompletes
                  ? "Reflection marked as completed with no additional notes recorded."
                  : "Awaiting Teacher Reflection — this section will update once the teacher submits their reflection."}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>DLF Evaluation System | Confidential Document</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default CoScholasticDoc;
