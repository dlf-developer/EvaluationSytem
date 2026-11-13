import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    render(<BestPractices />);

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
    render(<BestPractices />);

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

  test("opens detail modal when a practice card is clicked, and switches tabs", async () => {
    render(<BestPractices />);

    await waitFor(() => {
      expect(
        screen.getByText("Circle Time (Beginning / Goodbye / Reflection Time)")
      ).toBeInTheDocument();
    });

    const cardTitle = screen.getByText(
      "Circle Time (Beginning / Goodbye / Reflection Time)"
    );
    fireEvent.click(cardTitle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByText("Target Grade Levels")).toBeInTheDocument();

    // Switch to Implementation tab
    const implTab = screen.getByRole("button", { name: /implementation/i });
    fireEvent.click(implTab);

    expect(
      screen.getByText("Step-by-Step Teaching-Learning Process")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What You Need (Resources & Materials)")
    ).toBeInTheDocument();

    // Switch to NEP & Impact tab
    const nepTab = screen.getByRole("button", { name: /nep & impact/i });
    fireEvent.click(nepTab);

    expect(
      screen.getByText("National Education Policy (NEP 2020) Alignment")
    ).toBeInTheDocument();
    expect(screen.getByText("Key Success Factors")).toBeInTheDocument();

    // Close modal via Done button
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("toggles bookmarks and filters by saved practices", async () => {
    render(<BestPractices />);

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
    render(<BestPractices />);

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
    render(<BestPractices />);

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

    render(<BestPractices />);

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

    // Should immediately add and open the new practice modal & list item
    await waitFor(() => {
      const titles = screen.getAllByText("Innovative Math Lab Diagnostics");
      expect(titles.length).toBeGreaterThanOrEqual(1);
      const authors = screen.getAllByText("Rohit Sharma");
      expect(authors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
