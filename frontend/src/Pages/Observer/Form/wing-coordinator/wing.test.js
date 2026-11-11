import {
  inputsWingDLPS,
  inputsWingDLWS,
  getWingInputs,
  mergeWingReportItems,
} from "./wing";
import { getSchoolPortal, isDLWS, isDLPS } from "../../../../Utils/env";

describe("Wing Coordinator DLPS vs DLWS question configuration", () => {
  const originalEnv = { ...process.env };
  const originalLocation = window.location;

  const setHostname = (hostname) => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, hostname },
    });
  };

  afterEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  test("preserves existing 19 DLPS questions intact", () => {
    expect(inputsWingDLPS).toHaveLength(19);
    expect(inputsWingDLPS[1].question).toBe(
      "Anecdotal Records Updated? Any Concerns?"
    );
    expect(inputsWingDLPS[1].columns).toEqual(["Date", "Content"]);
    expect(inputsWingDLPS[15].question).toBe("Hygiene Concerns (Washrooms)");
    expect(inputsWingDLPS[17].question).toBe("Safety Concerns Observed");
    expect(inputsWingDLPS[17].columns).toEqual([
      "Date",
      "Content",
      "Ticket Raised",
      "Resolved?",
    ]);
  });

  test("configures 20 DLWS questions with all requested additions and edits", () => {
    expect(inputsWingDLWS).toHaveLength(20);

    // Question 2 inserted in order
    expect(inputsWingDLWS[1]).toEqual({
      question: "Report of Major Activities Conducted",
      type: "table",
      columns: [
        "Date",
        "Classes",
        "Venue",
        "What went well?",
        "What could've been better?",
      ],
    });

    // Cumulative Records moved to Q3 (shifted by new Q2)
    expect(inputsWingDLWS[2].question).toBe(
      "Cumulative Records, KYC, and PTM Records Updated on Edunext?"
    );
    expect(inputsWingDLWS[2].columns).toEqual(["Date", "Content"]);

    // List of Grievances (formerly Hygiene Concerns)
    expect(inputsWingDLWS[16].question).toBe(
      "List of Grievances for the Month?"
    );
    expect(inputsWingDLWS[16].columns).toEqual([
      "Date",
      "Content",
      "Ticket Raised",
      "Resolved?",
    ]);

    // Any Concerns in regards to Teachers (checkboxes removed)
    expect(inputsWingDLWS[18].question).toBe(
      "Any Concerns in regards to Teachers? One on One meetings conducted?"
    );
    expect(inputsWingDLWS[18].columns).toEqual(["Date", "Content"]);
  });

  test("dynamically selects DLWS vs DLPS across env, API URL, hostname, and backend hint", () => {
    delete process.env.REACT_APP_SCHOOL;
    process.env.REACT_APP_API_URL = "https://api.dlws.edu.in/api";
    expect(getSchoolPortal()).toBe("DLWS");
    expect(isDLWS()).toBe(true);
    expect(getWingInputs()).toBe(inputsWingDLWS);

    process.env.REACT_APP_API_URL = "https://evaluationapi.dlps.co.in/api";
    expect(getSchoolPortal()).toBe("DLPS");
    expect(isDLPS()).toBe(true);
    expect(getWingInputs()).toBe(inputsWingDLPS);

    // Generic API URL falls back to runtime domain hostname
    process.env.REACT_APP_API_URL = "/api";
    setHostname("evaluation.dlws.edu.in");
    expect(getSchoolPortal()).toBe("DLWS");
    expect(getWingInputs()).toBe(inputsWingDLWS);

    setHostname("evaluation.dlps.co.in");
    expect(getSchoolPortal()).toBe("DLPS");
    expect(getWingInputs()).toBe(inputsWingDLPS);

    // Localhost falls back to backend hint if env/hostname omit school
    setHostname("localhost");
    process.env.REACT_APP_API_URL = "http://localhost:8001/api";
    expect(getSchoolPortal("DLWS")).toBe("DLWS");
    expect(getWingInputs("DLWS")).toBe(inputsWingDLWS);
    expect(getSchoolPortal("DLPS")).toBe("DLPS");

    // Explicit REACT_APP_SCHOOL takes priority over everything
    process.env.REACT_APP_SCHOOL = "DLPS";
    expect(getSchoolPortal("DLWS")).toBe("DLPS");
    expect(getWingInputs("DLWS")).toBe(inputsWingDLPS);

    process.env.REACT_APP_SCHOOL = "DLWS";
    expect(getSchoolPortal("DLPS")).toBe("DLWS");
    expect(getWingInputs("DLPS")).toBe(inputsWingDLWS);
  });

  test("safely migrates legacy 19-question DLWS drafts/reports without index shift or stale checkboxes", () => {
    const legacySaved = inputsWingDLPS.map((q, idx) => {
      if (idx === 0) {
        return {
          ...q,
          tableData: [{ col_0: "2026-10-01", col_1: "V-A", col_2: "Kindness" }],
        };
      }
      if (idx === 1) {
        return {
          ...q,
          tableData: [{ col_0: "2026-10-02", col_1: "Updated all records" }],
        };
      }
      if (idx === 2) {
        return { ...q, answer: "Attended Edunext workshop" };
      }
      if (idx === 15) {
        return {
          ...q,
          tableData: [
            { col_0: "2026-10-05", col_1: "Grievance note", col_2: true, col_3: false },
          ],
        };
      }
      if (idx === 17) {
        return {
          ...q,
          tableData: [
            { col_0: "2026-10-08", col_1: "1:1 meeting held", col_2: true, col_3: true },
          ],
        };
      }
      return { ...q, answer: "", tableData: [{}], files: [] };
    });

    const merged = mergeWingReportItems(inputsWingDLWS, legacySaved);
    expect(merged).toHaveLength(20);

    // Q1 stays aligned
    expect(merged[0].tableData).toEqual([
      { col_0: "2026-10-01", col_1: "V-A", col_2: "Kindness" },
    ]);

    // New Q2 starts clean rather than pulling old Anecdotal data
    expect(merged[1].question).toBe("Report of Major Activities Conducted");
    expect(merged[1].tableData).toEqual([{}]);

    // Renamed Q3 receives old Q2 data
    expect(merged[2].question).toBe(
      "Cumulative Records, KYC, and PTM Records Updated on Edunext?"
    );
    expect(merged[2].tableData).toEqual([
      { col_0: "2026-10-02", col_1: "Updated all records" },
    ]);
    expect(merged[2].legacyQuestions).toBeUndefined();

    // Q4 text answer stays aligned (not overwritten by I C.A.R.E table)
    expect(merged[3].answer).toBe("Attended Edunext workshop");

    // Q17 Grievance keeps data & checkboxes
    expect(merged[16].question).toBe("List of Grievances for the Month?");
    expect(merged[16].tableData).toEqual([
      { col_0: "2026-10-05", col_1: "Grievance note", col_2: true, col_3: false },
    ]);

    // Q19 Teachers Concern keeps Date & Content but strips removed checkboxes
    expect(merged[18].question).toBe(
      "Any Concerns in regards to Teachers? One on One meetings conducted?"
    );
    expect(merged[18].tableData).toEqual([
      { col_0: "2026-10-08", col_1: "1:1 meeting held" },
    ]);
  });
});

