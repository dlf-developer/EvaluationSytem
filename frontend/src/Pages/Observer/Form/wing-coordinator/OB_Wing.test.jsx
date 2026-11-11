import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return mockAxios;
});

const mockToastFn = jest.fn();

jest.mock("@chakra-ui/react", () => {
  const React = require("react");
  const passthrough =
    (DefaultTag = "div") =>
    ({ children, as, ...props }) => {
      const Tag = typeof as === "string" ? as : DefaultTag;
      const safe = {};
      Object.keys(props).forEach((k) => {
        if (k === "onClick" || k === "className" || k === "style" || k === "id") {
          safe[k] = props[k];
        }
      });
      return React.createElement(Tag, safe, children);
    };
  return {
    Box: passthrough("div"),
    Flex: passthrough("div"),
    Heading: passthrough("h2"),
    Text: passthrough("p"),
    Button: passthrough("button"),
    Badge: passthrough("span"),
    Spinner: passthrough("div"),
    VStack: passthrough("div"),
    HStack: passthrough("div"),
    Progress: passthrough("div"),
    useToast: () => mockToastFn,
  };
});

jest.mock("./Fillter_Wing", () => function MockFilterWing() {
  return <div data-testid="mock-filter-wing" />;
});

jest.mock("../../../../Components/UI/Icons", () => {
  const React = require("react");
  const Icon = () => React.createElement("span");
  return {
    CheckCircleOutlined: Icon,
    FileTextOutlined: Icon,
    SaveOutlined: Icon,
    SendOutlined: Icon,
    ArrowRightOutlined: Icon,
    ArrowLeftOutlined: Icon,
    ReloadOutlined: Icon,
    SyncOutlined: Icon,
  };
});

import OB_Wing from "./OB_Wing";
import { inputsWingDLPS } from "./wing";
import * as userSlice from "../../../../redux/userSlice";

const createTestStore = () =>
  configureStore({
    reducer: {
      user: (
        state = {
          getFilteredDataList: null,
          loading: false,
          GetObserverLists: [],
        }
      ) => state,
    },
  });

const renderOBWing = () =>
  render(
    <Provider store={createTestStore()}>
      <MemoryRouter initialEntries={["/wing-coordinator/test-form-123"]}>
        <Routes>
          <Route path="/wing-coordinator/:id" element={<OB_Wing />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe("OB_Wing UI rendering for DLWS vs DLPS", () => {
  const originalEnv = { ...process.env };
  let getSingleSpy;

  beforeEach(() => {
    localStorage.clear();
    mockToastFn.mockClear();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    if (getSingleSpy) getSingleSpy.mockRestore();
  });

  test("renders all 20 DLWS Monthly Coordinator Report questions and fields properly", async () => {
    process.env.REACT_APP_SCHOOL = "DLWS";

    const legacyDlwsForm = {
      _id: "test-form-123",
      formName: "October DLWS Report",
      isDraft: true,
      isComplete: false,
      monthlyReport: inputsWingDLPS.map((q, idx) => {
        if (idx === 1) {
          return {
            ...q,
            tableData: [{ col_0: "2026-10-03", col_1: "Legacy Anecdotal Note" }],
          };
        }
        if (idx === 17) {
          return {
            ...q,
            tableData: [
              {
                col_0: "2026-10-09",
                col_1: "Teacher 1-on-1 Concern",
                col_2: true,
                col_3: false,
              },
            ],
          };
        }
        return { ...q, answer: "", tableData: [{}], files: [] };
      }),
    };

    getSingleSpy = jest
      .spyOn(userSlice, "GetSingleWingFrom")
      .mockImplementation(() => () =>
        Promise.resolve({
          payload: { success: true, data: legacyDlwsForm, schoolPortal: "DLWS" },
        })
      );

    const { container } = renderOBWing();

    await waitFor(() =>
      expect(screen.getByDisplayValue("October DLWS Report")).toBeInTheDocument()
    );

    const q2Heading = screen.getByText("Report of Major Activities Conducted", {
      selector: "h4",
    });
    const q2Card = q2Heading.closest(".bg-white");
    expect(within(q2Card).getByText("2")).toBeInTheDocument();
    expect(within(q2Card).getByText("S.No.")).toBeInTheDocument();
    expect(within(q2Card).getByText("Date")).toBeInTheDocument();
    expect(within(q2Card).getByText("Classes")).toBeInTheDocument();
    expect(within(q2Card).getByText("Venue")).toBeInTheDocument();
    expect(within(q2Card).getByText("What went well?")).toBeInTheDocument();
    expect(
      within(q2Card).getByText("What could've been better?")
    ).toBeInTheDocument();
    expect(within(q2Card).getByPlaceholderText("Classes")).toBeInTheDocument();
    expect(within(q2Card).getByPlaceholderText("Venue")).toBeInTheDocument();
    expect(
      within(q2Card).getByPlaceholderText("What went well?")
    ).toBeInTheDocument();
    expect(
      within(q2Card).getByPlaceholderText("What could've been better?")
    ).toBeInTheDocument();

    const q3Heading = screen.getByText(
      "Cumulative Records, KYC, and PTM Records Updated on Edunext?",
      { selector: "h4" }
    );
    const q3Card = q3Heading.closest(".bg-white");
    expect(within(q3Card).getByText("3")).toBeInTheDocument();
    expect(
      within(q3Card).getByDisplayValue("Legacy Anecdotal Note")
    ).toBeInTheDocument();

    const q17Heading = screen.getByText("List of Grievances for the Month?", {
      selector: "h4",
    });
    const q17Card = q17Heading.closest(".bg-white");
    expect(within(q17Card).getByText("17")).toBeInTheDocument();
    expect(within(q17Card).getByText("Ticket Raised")).toBeInTheDocument();
    expect(within(q17Card).getByText("Resolved?")).toBeInTheDocument();
    expect(within(q17Card).getAllByRole("checkbox")).toHaveLength(2);

    const q19Heading = screen.getByText(
      "Any Concerns in regards to Teachers? One on One meetings conducted?",
      { selector: "h4" }
    );
    const q19Card = q19Heading.closest(".bg-white");
    expect(within(q19Card).getByText("19")).toBeInTheDocument();
    expect(within(q19Card).queryByText("Ticket Raised")).toBeNull();
    expect(within(q19Card).queryByText("Resolved?")).toBeNull();
    expect(within(q19Card).queryAllByRole("checkbox")).toHaveLength(0);
    expect(
      within(q19Card).getByDisplayValue("Teacher 1-on-1 Concern")
    ).toBeInTheDocument();

    expect(container.querySelectorAll("h4")).toHaveLength(20);
  });

  test("preserves original 19 DLPS Monthly Coordinator Report questions when running DLPS", async () => {
    process.env.REACT_APP_SCHOOL = "DLPS";

    getSingleSpy = jest
      .spyOn(userSlice, "GetSingleWingFrom")
      .mockImplementation(() => () =>
        Promise.resolve({
          payload: {
            success: true,
            data: {
              _id: "test-dlps-1",
              formName: "October DLPS Report",
              isDraft: true,
              isComplete: false,
              monthlyReport: [],
            },
            schoolPortal: "DLPS",
          },
        })
      );

    const { container } = renderOBWing();

    await waitFor(() =>
      expect(screen.getByDisplayValue("October DLPS Report")).toBeInTheDocument()
    );

    expect(
      screen.getByText("Anecdotal Records Updated? Any Concerns?", {
        selector: "h4",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Report of Major Activities Conducted", {
        selector: "h4",
      })
    ).toBeNull();
    expect(
      screen.getByText("Hygiene Concerns (Washrooms)", { selector: "h4" })
    ).toBeInTheDocument();

    const safetyHeading = screen.getByText("Safety Concerns Observed", {
      selector: "h4",
    });
    const safetyCard = safetyHeading.closest(".bg-white");
    expect(within(safetyCard).getAllByRole("checkbox")).toHaveLength(2);

    expect(container.querySelectorAll("h4")).toHaveLength(19);
  });
});
