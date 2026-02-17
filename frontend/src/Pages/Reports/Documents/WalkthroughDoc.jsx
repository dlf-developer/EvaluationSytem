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

// ✅ Register Hindi + English Supported Font
Font.register({
  family: "NotoSansDevanagari",
  fonts: [
    {
      src: "/fonts/NotoSansDevanagari-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/NotoSansDevanagari-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});


function WalkthroughDoc({ data }) {
  const RenderData = ({ keyName, keylenght }) => (
    <>
      {data?.[keyName]?.map((item, index) => (
        <View key={item?._id || index} style={{ flexDirection: "row" }}>
          <View
            style={{
              borderRightWidth: 1,
              borderBottom: index + keylenght === 12 ? 0 : 1,
              padding: 5,
              width: "10%",
            }}
          >
            <Text style={styles.Question}>
              {index + keylenght}
            </Text>
          </View>

          <View
            style={{
              borderRightWidth: 1,
              padding: 6,
              borderBottom: index + keylenght === 12 ? 0 : 1,
              width: "70%",
            }}
          >
            <Text style={styles.Question}>
              {item?.question}
            </Text>
          </View>

          <View
            style={{
              padding: 5,
              borderBottom: index + keylenght === 12 ? 0 : 1,
              width: "20%",
            }}
          >
            <Text style={styles.boldText}>
              {item?.answer}
            </Text>
          </View>
        </View>
      ))}
    </>
  );

  const RenderFeedbackQuestion = ({ keyName }) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1 }}>
      {data?.[keyName]?.map((item, index) => (
        <React.Fragment key={index}>
          <View
            style={{
              borderRightWidth: 1,
              borderBottomWidth: 1,
              padding: 5,
              width: "20%",
              minHeight: 120,
            }}
          >
            <Text style={styles.boldText}>
              {index + 1}
            </Text>
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              padding: 5,
              width: "80%",
            }}
          >
            <Text style={styles.Question}>
              {item?.question}
            </Text>

            <Text style={[styles.boldText, { marginTop: 6 }]}>
              {item?.answer}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.section}>
            <Image src={Logo} style={styles.logo} />
            <Image src={LogoBanner} style={styles.logoBanner} />
          </View>

          <View style={styles.centered}>
            <Text style={styles.title}>
              VIRTUAL CLASSROOM WALK-THROUGH PROFORMA 2023-24 (V2.0)
            </Text>
          </View>

          {/* General Details */}
          <View style={styles.generalBox}>
            {[
              {
                question: "Name of the Visiting Teacher",
                ans: data?.grenralDetails?.NameoftheVisitingTeacher?.name,
              },
              {
                question: "Date",
                ans: getAllTimes(
                  data?.grenralDetails?.DateOfObservation
                )?.formattedDate2,
              },
              { question: "Class", ans: data?.grenralDetails?.className },
              { question: "Subject", ans: data?.grenralDetails?.Subject },
              { question: "Section", ans: data?.grenralDetails?.Section },
              { question: "Topic", ans: data?.grenralDetails?.Topic },
            ].map((item, index) => (
              <View key={index} style={{ width: "50%", marginBottom: 8 }}>
                <Text style={styles.Question}>
                  {item.question}:{" "}
                  <Text style={styles.boldText}>
                    {item.ans}
                  </Text>
                </Text>
              </View>
            ))}
          </View>

          {/* Question Table */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.headerCellSmall}>Sr. No</Text>
              <Text style={styles.headerCellLarge}>ITEM</Text>
              <Text style={styles.headerCellMedium}>REMARKS</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                ESSENTIAL AGREEMENTS
              </Text>
            </View>
            <RenderData keyName="essentialAggrements" keylenght={1} />

            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                PLANNING AND PREPARATION
              </Text>
            </View>
            <RenderData keyName="planingAndPreparation" keylenght={6} />
          </View>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.table}>
            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                CLASSROOM ENVIRONMENT
              </Text>
            </View>
            <RenderData keyName="classRoomEnvironment" keylenght={13} />

            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                INSTRUCTION
              </Text>
            </View>
            <RenderData keyName="instruction" keylenght={18} />
          </View>
        </View>
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.table}>
            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                ACADEMIC HEAD / COORDINATOR'S / HOD'S FEEDBACK
              </Text>
            </View>
            <RenderFeedbackQuestion keyName="ObserverFeedback" />

            <View style={styles.sectionHeader}>
              <Text style={styles.centerText}>
                TEACHER'S REFLECTION
              </Text>
            </View>
            <RenderFeedbackQuestion keyName="TeacherFeedback" />
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text style={styles.Question}>
              Principal's Signature
            </Text>
            <View style={{ width: 120, borderBottomWidth: 1, marginLeft: 10 }} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default WalkthroughDoc;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 20,
  },
  container: {
    borderWidth: 1,
    padding: 15,
  },
  section: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 100,
  },
  logoBanner: {
    width: 250,
    height: 70,
  },
  centered: {
    alignItems: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 12,
    fontFamily: "NotoSansDevanagari",
  },
  generalBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    padding: 8,
    marginBottom: 15,
  },
  table: {
    borderWidth: 1,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  headerCellSmall: {
    width: "10%",
    fontSize:14,
    padding: 5,
    borderRightWidth: 1,
    fontFamily: "NotoSansDevanagari",
  },
  headerCellLarge: {
    width: "70%",
    fontSize:14,
    padding: 5,
    borderRightWidth: 1,
    fontFamily: "NotoSansDevanagari",
  },
  headerCellMedium: {
    width: "20%",
    padding: 5,
    fontSize:14,
    fontFamily: "NotoSansDevanagari",
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 5,
  },
  centerText: {
    fontSize:14,
    textAlign: "center",
    fontFamily: "NotoSansDevanagari",
  },
  Question: {
    fontSize: 11,
    fontFamily: "NotoSansDevanagari",
  },
  boldText: {
    fontSize: 11,
    fontFamily: "NotoSansDevanagari",
    fontWeight: "bold",
  },
});
