import { Card } from "./UI";
import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";

function DynamicScroreThree({ col, formName }) {
  const [totalScore, setTotalScore] = useState(0);
  const [numOfParameters, setNumOfParameters] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [getOutOfScore, setGetOutOfScore] = useState(0);
  const [grade, setGrade] = useState("");

  const validValues = ["1", "2", "3"];
  const calculateSelfAssessmentScore = () => {
    // // Array of keys to iterate over
    const keyObject = [
      "maintenanceOfNotebooks",
      "qualityOfOppurtunities",
      "qualityOfTeacherFeedback",
      "qualityOfLearner",
    ];

    const formValues = formName;
    let totalScore = 0; // Total points scored
    let outOfScore = 0; // Maximum possible score based on valid answers
    let numOfParametersNA = 0; // Counter for "N/A" answers

    keyObject.forEach((section) => {
      if (formValues[section]) {
        formValues[section].forEach((item) => {
          const answer = item?.answer;

          // Only consider valid answers for both totalScore and outOfScore
          if (validValues?.includes(answer)) {
            totalScore += parseInt(answer, 10); // Accumulate score
            outOfScore += 3; // Increment max score (4 points per question)
          }

          // Count "N/A" answers
          if (["N/A", "NA", "N"].includes(answer)) {
            numOfParametersNA++; // Increment the count for "N/A"
          }
        });
      }
    });

    setTotalScore(totalScore); // Set total score
    setGetOutOfScore(outOfScore); // Set maximum possible score
    setNumOfParameters(numOfParametersNA); // Update state with total "N/A" answers

    // Calculate percentage
    const percentage = outOfScore > 0 ? (totalScore / outOfScore) * 100 : 0;
    setPercentageScore(parseFloat(percentage.toFixed(2))); // Set percentage

    // Determine grade
    const grade =
      percentage >= 90
        ? "A"
        : percentage >= 80
        ? "B"
        : percentage >= 70
        ? "C"
        : percentage >= 60
        ? "D"
        : "F";
    setGrade(grade); // Set grade
  };
  useEffect(() => {
    if (formName) {
      calculateSelfAssessmentScore();
    }
  }, [formName]);
  return (
    <Col md={col} className="mt-4">
      <Card>
        <h5>Total Score: {totalScore}</h5>
        <h5>Out of: {getOutOfScore}</h5>
        <h5>Percentage: {percentageScore}%</h5>
        <h5>Grade: {grade}</h5>
        <h5>Number Of Parameters: {numOfParameters}</h5>
      </Card>
    </Col>
  );
}

export default DynamicScroreThree;
