import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BestPractices from "./BestPractices";
import { getUserId } from "../../Utils/auth";
import {
  fetchAllBestPractices,
  createBestPracticeApi,
} from "../../redux/bestPracticesApi";
import testPractices from "./bestPracticesTestData.json";

jest.mock("../../Utils/auth", () => ({
  getUserId: jest.fn(() => ({ access: "Teacher" })),
}));

jest.mock("../../redux/bestPracticesApi", () => ({
  __esModule: true,
  fetchAllBestPractices: jest.fn(),
  createBestPracticeApi: jest.fn(),
}));

// Mock lucide-react icons for Jest
jest.mock("lucide-react", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => (props) =>
        React.createElement("span", { "data-icon": String(prop), ...props }),
    }
  );
});

const renderWithRouter = (initialRoute = "/best-practices") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/best-practices" element={<BestPractices />} />
        <Route path="/best-practices/:id" element={<BestPractices />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("BestPractices Component", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "";
    getUserId.mockReturnValue({ access: "Teacher" });
    fetchAllBestPractices.mockImplementation(() =>
      Promise.resolve(JSON.parse(JSON.stringify(testPractices)))
    );
    createBestPracticeApi.mockImplementation((formData) =>
      Promise.resolve({
        ...formData,
        id: 999,
        createdAt: new Date().toISOString(),
      })
    );
  });

  test("renders Best Practices header, search input, and practices list", async () => {
    renderWithRouter();

    expect(
      screen.getByRole("heading", { name: "Best Practices for Teachers" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Search practices, teachers, pedagogy, topics, keywords..."
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Circle Time (Beginning / Goodbye / Reflection Time)")
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /add best practice/i })
    ).not.toBeInTheDocument();
  });

  test("filters practices when typing in search input", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("Circle Time (Beginning / Goodbye / Reflection Time)")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Search practices, teachers, pedagogy, topics, keywords..."
    );

    fireEvent.change(searchInput, { target: { value: "Monika Verma" } });

    expect(screen.getByText("As I Leave DLF Public School")).toBeInTheDocument();
    expect(
      screen.queryByText("Circle Time (Beginning / Goodbye / Reflection Time)")
    ).not.toBeInTheDocument();
  });

  test("opens full-page detail view when a practice card is clicked, displaying rich pedagogical information without modal constraints, and can navigate back", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("Circle Time (Beginning / Goodbye / Reflection Time)")
      ).toBeInTheDocument();
    });

    const cardTitle = screen.getByText(
      "Circle Time (Beginning / Goodbye / Reflection Time)"
    );
    fireEvent.click(cardTitle);

    // Full page detail is rendered (not a modal dialog)
    await waitFor(() => {
      expect(screen.getByTestId("best-practice-detail")).toBeInTheDocument();
    });

    // Verify all key sections are visible directly on one full page
    expect(screen.getByText("Target Grade Levels")).toBeInTheDocument();
    expect(
      screen.getByText("Step-by-Step Teaching-Learning Process")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What You Need (Resources & Materials)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("National Education Policy (NEP 2020) Alignment")
    ).toBeInTheDocument();

    // Navigate back to the repository list
    const backBtn = screen.getByRole("button", { name: /back to best practices/i });
    fireEvent.click(backBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("best-practice-detail")).not.toBeInTheDocument();
      expect(screen.getByTestId("results-count")).toBeInTheDocument();
    });
  });

  test("supports high-density tab navigation in Best Practice Detail view with minimal scrolling", async () => {
    renderWithRouter("/best-practices/3");

    await waitFor(() => {
      expect(screen.getByTestId("best-practice-detail")).toBeInTheDocument();
    });

    // Verify Tab 1 (Classroom Delivery) is active by default
    expect(screen.getByRole("button", { name: /classroom delivery/i })).toBeInTheDocument();
    expect(screen.getByText("Step-by-Step Teaching-Learning Process")).toBeInTheDocument();
    expect(screen.getByText("What You Need (Resources & Materials)")).toBeInTheDocument();

    // Switch to Tab 2 (Pedagogy & NEP 2020)
    const frameworkTab = screen.getByRole("button", { name: /pedagogy & nep 2020/i });
    fireEvent.click(frameworkTab);

    expect(screen.getByText("Pedagogical Matrix & Competencies")).toBeInTheDocument();
    expect(screen.getByText(/8 Pillars Active/i)).toBeInTheDocument();

    // Switch to Tab 3 (Assessment & Impact)
    const assessmentTab = screen.getByRole("button", { name: /assessment & impact/i });
    fireEvent.click(assessmentTab);

    expect(screen.getByText("Evidence of Learning & Real Classroom Impact")).toBeInTheDocument();
    expect(screen.getByText("Assessment Strategy & Tools")).toBeInTheDocument();

    // Switch to Tab 4 (Inclusivity & Media)
    const inclusivityTab = screen.getByRole("button", { name: /inclusivity & media/i });
    fireEvent.click(inclusivityTab);

    expect(screen.getByText(/Inclusivity & Remedial \/ Differentiated Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Classroom Documentation & Artifacts/i)).toBeInTheDocument();

    // Switch to All Sections
    const allTab = screen.getByRole("button", { name: /all sections/i });
    fireEvent.click(allTab);

    expect(screen.getByText("Step-by-Step Teaching-Learning Process")).toBeInTheDocument();
    expect(screen.getByText("Pedagogical Matrix & Competencies")).toBeInTheDocument();
    expect(screen.getByText("Evidence of Learning & Real Classroom Impact")).toBeInTheDocument();
  });

  test("supports direct deep-linking via /best-practices/:id route to open full page directly", async () => {
    renderWithRouter("/best-practices/3");

    await waitFor(() => {
      expect(screen.getByTestId("best-practice-detail")).toBeInTheDocument();
      expect(screen.getByText("As I Leave DLF Public School")).toBeInTheDocument();
    });

    expect(screen.getByText("Monika Verma")).toBeInTheDocument();
  });

  test("toggles bookmarks and filters by saved practices", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("Circle Time (Beginning / Goodbye / Reflection Time)")
      ).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByTitle("Save Practice");
    expect(saveButtons.length).toBeGreaterThan(0);

    // Bookmark first card
    fireEvent.click(saveButtons[0]);

    // Click "Saved Practices" filter
    const savedFilterBtn = screen.getByRole("button", {
      name: /saved practices/i,
    });
    fireEvent.click(savedFilterBtn);

    // Should only show 1 practice now
    expect(screen.getByTestId("results-count")).toHaveTextContent(
      "Showing 1 of 23 practices"
    );
  });

  test("toggles full-breadth accordion filter when All Filters button is clicked", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId("results-count")).toBeInTheDocument();
    });

    // Accordion should initially be collapsed
    expect(
      screen.queryByText("Filter by Pedagogical Dimensions")
    ).not.toBeInTheDocument();

    const allFiltersBtn = screen.getByRole("button", { name: /all filters/i });
    expect(allFiltersBtn).toBeInTheDocument();

    // Click to expand accordion
    fireEvent.click(allFiltersBtn);
    expect(
      screen.getByText("Filter by Pedagogical Dimensions")
    ).toBeInTheDocument();
    expect(screen.getByText("NEP & Assessment")).toBeInTheDocument();

    // Click collapse
    const collapseBtn = screen.getByRole("button", { name: /collapse/i });
    fireEvent.click(collapseBtn);
    expect(
      screen.queryByText("Filter by Pedagogical Dimensions")
    ).not.toBeInTheDocument();
  });

  test("filters practices using top major grade tabs", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId("results-count")).toBeInTheDocument();
    });

    // Click Middle (VI–VIII) tab
    const middleTab = screen.getByRole("button", {
      name: /^Middle \(VI–VIII\)/,
    });
    fireEvent.click(middleTab);

    // Results count should be updated
    expect(screen.getByTestId("results-count")).toHaveTextContent(
      "Showing 17 of 23 practices"
    );

    // Click "All Grades" tab to reset
    const allGradesTab = screen.getByRole("button", { name: /^All Grades/ });
    fireEvent.click(allGradesTab);
    expect(screen.getByTestId("results-count")).toHaveTextContent(
      "Showing 23 of 23 practices"
    );
  });

  test("admin can see Add Best Practice button, open form, and publish a new practice", async () => {
    getUserId.mockReturnValue({ access: "Superadmin" });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId("results-count")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /add best practice/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);

    expect(screen.getByText("Add New Best Practice")).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Circle Time/i), {
      target: { value: "Innovative Math Lab Diagnostics" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Dipika Bhanot/i), {
      target: { value: "Rohit Sharma" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Provide a concise 2-4 sentence summary/i),
      {
        target: {
          value:
            "A hands-on manipulative workshop approach to mastering foundational geometry.",
        },
      }
    );

    // Select grade
    fireEvent.click(screen.getByRole("button", { name: "Middle (VI–VIII)" }));

    // Advance to Step 4 (Documentation) to publish
    fireEvent.click(
      screen.getByRole("button", { name: /2\. Curriculum & NEP/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /3\. TLP & Execution/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /4\. Documentation/i })
    );

    const publishBtn = screen.getByRole("button", {
      name: /publish best practice/i,
    });
    fireEvent.click(publishBtn);

    // Should immediately open the new practice full page view
    await waitFor(() => {
      expect(screen.getByTestId("best-practice-detail")).toBeInTheDocument();
      const titles = screen.getAllByText("Innovative Math Lab Diagnostics");
      expect(titles.length).toBeGreaterThanOrEqual(1);
      const authors = screen.getAllByText("Rohit Sharma");
      expect(authors.length).toBeGreaterThanOrEqual(1);
    });
  });

  test("renders Best Practice Template download buttons and handles download", async () => {
    renderWithRouter();

    const docxBtn = screen.getByRole("button", {
      name: /download best practice template \(\.docx\)/i,
    });
    const pdfBtn = screen.getByRole("button", {
      name: /printable pdf/i,
    });

    expect(docxBtn).toBeInTheDocument();
    expect(pdfBtn).toBeInTheDocument();

    const clickSpy = jest.fn();
    const origCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const el = origCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    fireEvent.click(docxBtn);
    expect(clickSpy).toHaveBeenCalled();

    document.createElement.mockRestore();
  });
});
