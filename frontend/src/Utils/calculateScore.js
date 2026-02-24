import { questions } from "../Components/normalData"

export const calculateScore = (data) => {
    const newdata = data.map((item) => {
        return {
            ...item,
            teacherScore: calculateScorenew(item.teacherForm),
            observerScore: calculateScorenew(item.observerForm),
        }
    })
    return newdata
}

const calculateScorenew = (values) => {
    let score = 0;

    questions.forEach((key) => {
        const answer = values[key?.key];
        if (answer === "Yes") score += 1; // Add 1 for "Yes"
        else if (answer === "No") score += 0; // No points for "No"
        else if (answer === "Sometimes") score += 0.5; // Add 0.5 for "0.5"
        // Ignore "N/A" (or any undefined answer)
    });
    return score
};
// const getTotalScorevalu = (formValue) => {
//     const validValues = ["Yes", "No", "Sometimes"]; // Include these values
//     const count = Object.values(formValue).filter((value) =>
//         validValues.includes(value)
//     ).length;
//     return count
// };

