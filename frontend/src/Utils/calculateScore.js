import { questions, questionsOld, cutoffDate } from "../Components/normalData";

export const calculateScore = (data) => {
  const newdata = data.map((item) => {
    const currentQuestions =
      item.createdAt && new Date(item.createdAt) < new Date(cutoffDate)
        ? questionsOld
        : questions;

    const teacherResult = calculateScorenew(item.teacherForm, currentQuestions);
    const observerResult = calculateScorenew(
      item.observerForm,
      currentQuestions,
    );

    return {
      ...item,
      teacherScore: teacherResult.score,
      teacherTotal: teacherResult.total,
      observerScore: observerResult.score,
      observerTotal: observerResult.total,
    };
  });
  return newdata;
};

export const calculateScorenew = (values, currentQuestions) => {
  let score = 0;
  let total = 0;

  if (!values) return { score: 0, total: 0 };

  currentQuestions.forEach((key) => {
    const answer = values[key?.key];
    if (answer === "Yes") {
      score += 1;
      total += 1;
    } else if (answer === "No") {
      score += 0;
      total += 1;
    } else if (answer === "Sometimes") {
      score += 0.5;
      total += 1;
    }
    // Ignore "N/A" (or any undefined answer)
  });
  return { score, total };
};
// const getTotalScorevalu = (formValue) => {
//     const validValues = ["Yes", "No", "Sometimes"]; // Include these values
//     const count = Object.values(formValue).filter((value) =>
//         validValues.includes(value)
//     ).length;
//     return count
// };
