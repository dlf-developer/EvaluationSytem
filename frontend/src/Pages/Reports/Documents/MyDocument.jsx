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
import AnswerComp from "./AnswerComp";
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../../Components/normalData";

// Font.register({
//   family: "PT Serif",
//   src: "http://fonts.gstatic.com/s/ptserif/v8/EgBlzoNBIHxNPCMwXaAhYPesZW2xOQ-xsNqO47m55DA.ttf",
// });
// Font.register({
//   family: "Gilda Display",
//   src: "http://fonts.gstatic.com/s/gildadisplay/v4/8yAVUZLLZ3wb7dSsjix0CP1Ie94GXVQ4L73iNy0KJ5Y.ttf",
// });

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

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    justifyContent: "flex-start",
  },
  constiner: {
    borderWidth: 1,
    margin: 20,
    padding: 20,
    paddingTop: 0,
    width: "100%",
  },
  section: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 120,
  },
  logoBanners: {
    width: 300,
    height: 80,
  },
  Centered: {
    justifyContent: "center",
    flexDirection: "row",
    // fontFamily: "PT Serif",
    marginBottom: 5,
  },
  Question: {
    // fontFamily: "Gilda Display",
    fontFamily: "Open Sans",
    fontSize: 11,
  },
  testCenter: {
    textAlign: "center",
  },
});

// Create Document Component
const MyDocument = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.constiner}>
          <View style={styles.section}>
            <Image src={Logo} style={styles.logo} />
            <Image src={LogoBanner} style={styles.logoBanners} />
          </View>
          <View style={[styles.Centered]}>
            <Text>Fortnightly Monitor</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.constiner,
                { padding: 0, margin: 0, width: "70%" },
              ]}
            >
              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>Questions</Text>
              </View>

              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text>Class & Section</Text>
              </View>
              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text>Date</Text>
              </View>

              {(data?.createdAt < cutoffDate ? questionsOld : questions).map(
                (item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.Question,
                      {
                        padding: 5,
                        paddingBottom: 3,
                        paddingTop: 3,
                        borderBottomWidth: 1,
                      },
                    ]}
                  >
                    <Text>{item.name}</Text>
                  </View>
                ),
              )}

              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text>Total Score</Text>
              </View>

              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <Text>Out of</Text>
              </View>
            </View>

            <View
              style={[
                styles.constiner,
                { padding: 0, margin: 0, borderLeftWidth: 0, width: "20%" },
              ]}
            >
              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>Teacher</Text>
              </View>

              <AnswerComp data={data} type={"teacherForm"} />
            </View>

            {/* Section 3 */}
            <View
              style={[
                styles.constiner,
                { padding: 0, margin: 0, borderLeftWidth: 0, width: "20%" },
              ]}
            >
              <View
                style={[
                  styles.Question,
                  {
                    padding: 5,
                    paddingBottom: 3,
                    paddingTop: 3,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>Observer</Text>
              </View>

              <AnswerComp data={data} type={"observerForm"} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
