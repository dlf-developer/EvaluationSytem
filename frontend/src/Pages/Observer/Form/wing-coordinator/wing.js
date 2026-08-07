// Each entry: { question, type: "text"|"table", columns?: string[] }
export const inputsWing = [
  {
    question: "Morning Assembly Planning & Coordination",
    type: "table",
    columns: ["Date", "Class on Duty", "Theme of the Assembly", "Highlights", "Any Reward?", "Any Issues Faced?"],
  },
  {
    question: "Anecdotal Records Updated? Any Concerns?",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "PD Sessions Attended by WC and Team? Teachers Updated it on Edunext?",
    type: "text",
  },
  {
    question: "I C.A.R.E Certificates for the Month?",
    type: "table",
    columns: ["Date", "Student Name", "Class", "Whether posted on edunext", "Content"],
  },
  {
    question: "Experiential Think Rooms / Micro Teaching Sessions Attended ",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Key Outcomes of Result Discussion?",
    type: "table",
    columns: [
      "Concern subjects and class",
      "High achiever Subjects and class",
      "Any smilye awarded to class",
      "Any smilye awarded to teacher",
    ],
    allowFileUpload: true,
  },
  {
    question: "Identified Learners on the Way (L.O.W.)",
    type: "table",
    columns: ["Name", "Class Section", "Subject", "Strength of child", "Action plan", "Remarks"],
    allowFileUpload: true,
  },
  {
    question: "C.W.S.N Names & Progress",
    type: "table",
    columns: [
      "Name, Class & Sec",
      "Identified using PRASHAST Checklists (Y/N)",
      "Receiving Sensorium / Counsellor Intervention (Y/N)",
      "Diagnosis",
      "Half yearly progress",
      "Team Meetings Conducted Offline or Online (Y/N)",
    ],
  },
  {
    question: "Parent Meetings (Online/Offline)",
    type: "table",
    columns: ["Date", "Name of the Teacher", "Name of the Student", "Class & Section", "Reason of Meeting", "Outcome of meeting"],
    allowFileUpload: true,
  },
  {
    question: "Detention arranged/ Extra input classes",
    type: "table",
    columns: ["Date", "Detention/extra input class?", "Name of the MT/ST/WC", "Name of the Students", "Class & Section", "Name of the subject", "Outcome"],
  },
  {
    question: "Care Calls Made",
    type: "table",
    columns: ["Date", "Name of the MT/ST/WC", "Name of the Student", "Class & Section", "Reason", "Outcome"],
    allowFileUpload: true,
  },
  {
    question: "Reflection Forms Filled",
    type: "table",
    columns: ["Date", "Content"],
  },
  {
    question: "Last Syllabus Completion Check Date",
    type: "text",
  },
  {
    question: "Class and Subject Work Status",
    type: "table",
    columns: [
      "Date",
      "Class",
      "Name of student",
      "Subject",
      "Status of work",
      "Status of checking",
      "Feedback/Action plan",
    ],
  },
  {
    question: "Excursions Planned",
    type: "table",
    columns: [
      "Date of excursion",
      "Class",
      "Venue",
      "Teachers accompany",
      "Feedback/concerns",
    ],
  },
  {
    question: "Hygiene Concerns (Washrooms)",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Concerns Flagged During Dispersal",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Safety Concerns Observed",
    type: "table",
    columns: ["Date", "Content", "Ticket Raised", "Resolved?"],
  },
  {
    question: "Additional Comments? (+ve / -ve)",
    type: "text",
  },
];