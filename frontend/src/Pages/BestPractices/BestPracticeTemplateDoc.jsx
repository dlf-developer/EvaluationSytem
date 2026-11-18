import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { LOGO_BASE64, BANNER_BASE64 } from "../Reports/logoAssets";
import { PDF_FONT } from "../Reports/pdfFonts";

const C = {
  primary: "#4A6741",
  primaryDark: "#1a4d2e",
  primaryLight: "#F0F4EF",
  gray: "#6B7280",
  lightGray: "#F9FAFB",
  border: "#D1D5DB",
  borderLight: "#E5E7EB",
  white: "#FFFFFF",
  text: "#2D2A26",
  textMuted: "#5C5852",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: PDF_FONT,
    fontSize: 8.5,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 28,
    color: C.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: C.primary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 36, height: 44 },
  logoBanner: { width: 140, height: 36, marginLeft: 8 },
  headerRight: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: C.primaryDark,
    textAlign: "right",
  },
  docSub: {
    fontSize: 7.5,
    color: C.textMuted,
    textAlign: "right",
    marginTop: 2,
    maxWidth: 240,
  },

  // Callout Box
  callout: {
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#C5D8C1",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  calloutTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: C.primaryDark,
    marginBottom: 3,
  },
  calloutText: {
    fontSize: 7.5,
    color: C.text,
    lineHeight: 1.35,
    marginBottom: 4,
  },
  calloutBullet: {
    fontSize: 7.2,
    color: C.textMuted,
    lineHeight: 1.3,
    marginLeft: 6,
    marginBottom: 2,
  },

  // Section Heading
  sectionHeader: {
    backgroundColor: C.primary,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: C.white,
  },
  sectionHint: {
    fontSize: 7,
    color: "#E2EBDD",
    fontStyle: "italic",
  },

  // Form Fields & Tables
  table: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderLight,
    minHeight: 18,
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 18,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F3F5F2",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableColHeader: {
    padding: 4,
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.primaryDark,
  },
  tableLabelCell: {
    width: "28%",
    backgroundColor: "#FAFBF9",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: C.borderLight,
    justifyContent: "center",
  },
  tableLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.text,
  },
  tableValueCell: {
    flex: 1,
    padding: 5,
    justifyContent: "center",
  },
  tablePlaceholder: {
    fontSize: 7.5,
    color: C.gray,
    fontStyle: "italic",
  },

  // Checkbox Grid
  checkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
    gap: 4,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 3,
  },
  checkItem33: {
    flexDirection: "row",
    alignItems: "center",
    width: "32%",
    marginBottom: 3,
  },
  checkBox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 1.5,
    marginRight: 4,
    backgroundColor: C.white,
  },
  checkText: {
    fontSize: 7.5,
    color: C.text,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.borderLight,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6.5,
    color: C.gray,
  },
});

export const BestPracticeTemplateDoc = () => (
  <Document
    title="DLF Best Practice Documentation Template"
    author="DLF Public School"
    subject="Pedagogical Best Practice Documentation Form"
  >
    {/* Page 1: Overview, Objectives, and Curriculum Alignment */}
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          {LOGO_BASE64 ? <Image src={LOGO_BASE64} style={s.logo} /> : null}
          {BANNER_BASE64 ? <Image src={BANNER_BASE64} style={s.logoBanner} /> : null}
        </View>
        <View style={s.headerRight}>
          <Text style={s.docTitle}>Best Practice Documentation</Text>
          <Text style={s.docSub}>
            Share a practice that works in your classroom or across the school so every teacher can learn from it.
          </Text>
        </View>
      </View>

      {/* Before You Start Box */}
      <View style={s.callout}>
        <Text style={s.calloutTitle}>Before You Start — Guidelines for Teachers</Text>
        <Text style={s.calloutText}>
          Write it so that a teacher who has never seen your practice could run it from this document alone.
          Tick only what truly applies. Replace italicized placeholders with your own words.
        </Text>
        <Text style={s.calloutBullet}>• State the exact grades/classes where the practice runs (e.g. Classes I–XII, whole school).</Text>
        <Text style={s.calloutBullet}>• Detail clear steps: who does what, and when — including the closing follow-up.</Text>
        <Text style={s.calloutBullet}>• Provide one short example in action and use inclusive language (e.g. "learners on the way").</Text>
        <Text style={s.calloutBullet}>• Attach 2–4 photos of the practice without identifying individual confidential student needs.</Text>
      </View>

      {/* Section 1: Overview */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>1. Best Practice Overview</Text>
        <Text style={s.sectionHint}>Core practice identification</Text>
      </View>
      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Name of Best Practice</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>A short, memorable name</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Subject & Grade</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Subject(s) and exact classes, e.g. English | Classes III–IX</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Theme</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>e.g. Critical Thinking, Experiential Learning, Life Skills, Art Integration, FLN</Text></View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Brief Description</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>What is the practice, why it matters, and what it achieves for learners (5–8 lines)</Text>
          </View>
        </View>
      </View>

      {/* Section 2: Curriculum Alignment */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>2. Curriculum Alignment</Text>
        <Text style={s.sectionHint}>Tick all competencies that apply</Text>
      </View>
      <View style={s.table}>
        <View style={s.checkGrid}>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Knowledge</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Skill</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Application</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>HOTS (Higher Order)</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Values / Life Skills</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Other: _______________</Text></View>
        </View>
      </View>

      {/* Section 3: Learning Objectives */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>3. Learning Objectives</Text>
        <Text style={s.sectionHint}>Students will be able to (action verbs: identify, explain, apply, create)</Text>
      </View>
      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Objective 1</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Start with an action verb, e.g. identify, explain, demonstrate...</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Objective 2</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Specific measurable learner outcome...</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Objective 3</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Application or problem-solving capability...</Text></View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Objective 4</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Value, perspective or reflective learning goal...</Text></View>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>DLF Public School — Pedagogical Best Practices Repository</Text>
        <Text style={s.footerText}>Page 1 of 3</Text>
      </View>
    </Page>

    {/* Page 2: Teaching-Learning Process, Assessment, Inclusivity */}
    <Page size="A4" style={s.page}>
      {/* Section 4: Teaching–Learning Process */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>4. Teaching–Learning Process</Text>
        <Text style={s.sectionHint}>Pedagogy & execution</Text>
      </View>

      <View style={[s.table, { marginBottom: 4 }]}>
        <View style={{ padding: 4, backgroundColor: "#FAFBF9", borderBottomWidth: 0.5, borderBottomColor: C.borderLight }}>
          <Text style={[s.tableLabel, { fontSize: 7 }]}>Pedagogical Approach (Tick all that apply):</Text>
        </View>
        <View style={s.checkGrid}>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Experiential Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Inquiry-Based Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Art-Integrated Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Sports-Integrated Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Project-Based Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>ICT-Enabled Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Socio-Emotional Learning (SEL)</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Other: ____________________</Text></View>
        </View>
      </View>

      {/* Strategy Table */}
      <View style={[s.table, { marginBottom: 4 }]}>
        <View style={s.tableHeaderRow}>
          <View style={{ width: "10%", padding: 4 }}><Text style={s.tableColHeader}>Step</Text></View>
          <View style={{ width: "65%", padding: 4 }}><Text style={s.tableColHeader}>What happens (in order, as a new teacher would do it)</Text></View>
          <View style={{ width: "25%", padding: 4 }}><Text style={s.tableColHeader}>Who / When</Text></View>
        </View>
        {[1, 2, 3, 4, 5, 6].map((num, i) => (
          <View key={num} style={i === 5 ? s.tableRowLast : s.tableRow}>
            <View style={{ width: "10%", padding: 4, justifyContent: "center", borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
              <Text style={{ fontSize: 7.5, fontWeight: "bold", textAlign: "center" }}>{num}</Text>
            </View>
            <View style={{ width: "65%", padding: 4, justifyContent: "center", borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
              <Text style={s.tablePlaceholder}>{num === 1 ? "Preparation / Hook activity..." : num === 6 ? "Closure, consolidation, follow-up..." : "Action step..."}</Text>
            </View>
            <View style={{ width: "25%", padding: 4, justifyContent: "center" }}>
              <Text style={s.tablePlaceholder}>Teacher / Learners</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Example in Action</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>Describe one real instance, e.g. "When a new child joins Grade 2..."</Text>
          </View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Duration / Frequency</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>e.g. 15 minutes daily; once a term; year-long</Text>
          </View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Learning Resources</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>e.g. textbook, worksheets, AQAD board, digital tools, lab kits</Text>
          </View>
        </View>
      </View>

      {/* Section 5: Assessment & Evidence */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>5. Assessment & Evidence of Learning</Text>
        <Text style={s.sectionHint}>Evaluation methods</Text>
      </View>
      <View style={s.table}>
        <View style={s.checkGrid}>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Formative</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Summative</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Competency-Based</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Self / Peer Assessment</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Assessment Tools</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>e.g. rubrics, worksheets, observation, quiz, portfolio, oral check</Text>
          </View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Evidence of Learning</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>Observed changes in learners, results, feedback or sample work</Text>
          </View>
        </View>
      </View>

      {/* Section 6: Inclusivity & Differentiation */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>6. Inclusivity & Differentiation</Text>
        <Text style={s.sectionHint}>No learner left behind</Text>
      </View>
      <View style={s.table}>
        <View style={s.checkGrid}>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Learners on the Way</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>Advanced Learners</Text></View>
          <View style={s.checkItem33}><View style={s.checkBox} /><Text style={s.checkText}>CWSN / Inclusion</Text></View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Remedial / Enrichment</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>How you adapt the practice so every learner can participate and succeed</Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>DLF Public School — Pedagogical Best Practices Repository</Text>
        <Text style={s.footerText}>Page 2 of 3</Text>
      </View>
    </Page>

    {/* Page 3: NEP 2020, References, Photos, Replicability, Details */}
    <Page size="A4" style={s.page}>
      {/* Section 7: Alignment with NEP 2020 */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>7. Alignment with NEP 2020</Text>
        <Text style={s.sectionHint}>Tick focus areas developed</Text>
      </View>
      <View style={s.table}>
        <View style={s.checkGrid}>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Foundational Literacy & Numeracy (FLN)</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Experiential Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Critical & Creative Thinking</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Multidisciplinary Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>21st Century Skills</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Socio-Emotional Learning (SEL)</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Joyful Learning</Text></View>
          <View style={s.checkItem}><View style={s.checkBox} /><Text style={s.checkText}>Indian Knowledge Systems (IKS)</Text></View>
        </View>
      </View>

      {/* Section 8: Reference Materials */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>8. Reference Materials</Text>
        <Text style={s.sectionHint}>Links & resources</Text>
      </View>
      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Lesson Plan / Guide</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Link or internal document name</Text></View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Video Demonstration</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>Video recording link or reference URL</Text></View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Additional Resources</Text></View>
          <View style={s.tableValueCell}><Text style={s.tablePlaceholder}>CBSE circulars, NCERT documents, DIKSHA links...</Text></View>
        </View>
      </View>

      {/* Section 9: Photos */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>9. Photos & Evidence</Text>
        <Text style={s.sectionHint}>Paste 2–4 clear photos with one-line captions below</Text>
      </View>
      <View style={[s.table, { height: 60, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFBF9" }]}>
        <Text style={s.tablePlaceholder}>[ Paste 2–4 clear photos of practice in action with descriptive captions ]</Text>
      </View>

      {/* Section 10: Replicability & Sustainability */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>10. Replicability & Sustainability</Text>
        <Text style={s.sectionHint}>Ease and scaling factors</Text>
      </View>
      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Ease of Implementation</Text></View>
          <View style={[s.tableValueCell, { flexDirection: "row", gap: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}><View style={s.checkBox} /><Text style={s.checkText}>High</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center" }}><View style={s.checkBox} /><Text style={s.checkText}>Medium</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center" }}><View style={s.checkBox} /><Text style={s.checkText}>Low</Text></View>
          </View>
        </View>
        <View style={s.tableRow}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Replication</Text></View>
          <View style={[s.tableValueCell, { flexDirection: "row", gap: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}><View style={s.checkBox} /><Text style={s.checkText}>Yes</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center" }}><View style={s.checkBox} /><Text style={s.checkText}>With modifications</Text></View>
          </View>
        </View>
        <View style={s.tableRowLast}>
          <View style={s.tableLabelCell}><Text style={s.tableLabel}>Key Success Factors</Text></View>
          <View style={s.tableValueCell}>
            <Text style={s.tablePlaceholder}>3–5 critical factors that make this practice successful</Text>
          </View>
        </View>
      </View>

      {/* Section 11: Documentation Details */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>11. Documentation Details</Text>
        <Text style={s.sectionHint}>Sign-off & verification</Text>
      </View>
      <View style={s.table}>
        <View style={s.tableRow}>
          <View style={{ width: "33.3%", padding: 4, borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
            <Text style={s.tableLabel}>Teacher Name(s):</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
          <View style={{ width: "33.3%", padding: 4, borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
            <Text style={s.tableLabel}>Department / Wing:</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
          <View style={{ width: "33.3%", padding: 4 }}>
            <Text style={s.tableLabel}>Academic Year:</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
        </View>
        <View style={s.tableRowLast}>
          <View style={{ width: "33.3%", padding: 4, borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
            <Text style={s.tableLabel}>Date Implemented:</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
          <View style={{ width: "33.3%", padding: 4, borderRightWidth: 0.5, borderRightColor: C.borderLight }}>
            <Text style={s.tableLabel}>Peer Buddy / Reviewer:</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
          <View style={{ width: "33.3%", padding: 4 }}>
            <Text style={s.tableLabel}>Reviewed / Approved By:</Text>
            <Text style={[s.tablePlaceholder, { marginTop: 8 }]}>_________________________</Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>DLF Public School — Pedagogical Best Practices Repository</Text>
        <Text style={s.footerText}>Page 3 of 3</Text>
      </View>
    </Page>
  </Document>
);

export default BestPracticeTemplateDoc;
