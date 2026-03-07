import { Font, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import { getAllTimes } from "../../../Utils/auth";
import {
  questions,
  questionsOld,
  cutoffDate,
} from "../../../Components/normalData";

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

function AnswerComp({ data, type }) {
  const [totalCount, setTotalCount] = useState(0);
  const [selfAssessCount, setSelfAssessCount] = useState(0);

  useEffect(() => {
    if (!data || !data[type]) return;

    const validValues = ["Yes", "No", "Sometimes"];

    // Calculate total valid responses
    const count = Object.values(data[type]).filter((value) =>
      validValues.includes(value),
    ).length;
    setTotalCount(count);

    // Calculate self-assessment score
    const score = Object.values(data[type]).reduce((sum, value) => {
      if (value === "Yes") return sum + 1;
      if (value === "Sometimes") return sum + 0.5;
      return sum; // "No" or other invalid values add 0
    }, 0);
    setSelfAssessCount(score);
  }, [data, type]);

  const renderField = (fieldName) => (
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
      <Text style={[styles.testCenter]}>
        {data?.[type]?.[fieldName] || "-"}
      </Text>
    </View>
  );

  return (
    <>
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
        {/* <Text style={styles.testCenter}>{data?.className?.className}/{data?.section}</Text> */}
        <Text style={styles.testCenter}>
          {typeof data?.className === "object"
            ? data.className.name
            : data?.className}
          /{data?.section}
        </Text>
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
        <Text style={styles.testCenter}>
          {getAllTimes(data?.date).formattedDate2 || "-"}
        </Text>
      </View>

      {(new Date(data?.createdAt) < new Date(cutoffDate)
        ? questionsOld
        : questions
      ).map((field, index) => (
        <View key={index}>{renderField(field?.key)}</View>
      ))}

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
        <Text style={styles.testCenter}>{selfAssessCount}</Text>
      </View>

      {/* Total Count */}
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
        <Text style={styles.testCenter}>{totalCount}</Text>
      </View>
    </>
  );
}

export default AnswerComp;

const styles = StyleSheet.create({
  Question: {
    fontSize: 11,
  },
  testCenter: {
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Open Sans",
  },
});
