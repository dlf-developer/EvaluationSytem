import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockPost = jest.fn();
const mockPut = jest.fn();
const mockGet = jest.fn();

jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: (...args) => mockPut(...args),
    delete: jest.fn(),
  };
  return mockAxios;
});

jest.mock("lucide-react", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => () =>
        React.createElement("span", { "data-icon": String(prop) }),
    }
  );
});

jest.mock("@chakra-ui/react", () => {
  const React = require("react");
  const passthrough =
    (DefaultTag = "div") =>
    ({ children, as, ...props }) => {
      const Tag = typeof as === "string" ? as : DefaultTag;
      const safe = {};
      Object.keys(props).forEach((k) => {
        if (k === "onClick" || k === "className" || k === "style" || k === "title") {
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
    Avatar: passthrough("div"),
    Badge: passthrough("span"),
    Breadcrumb: passthrough("nav"),
    BreadcrumbItem: passthrough("span"),
    BreadcrumbLink: passthrough("a"),
    Stack: passthrough("div"),
    Divider: () => React.createElement("hr"),
    HStack: passthrough("div"),
    Tag: passthrough("span"),
    Button: passthrough("button"),
  };
});

jest.mock("./UI/Icons", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => () =>
        React.createElement("span", { "data-icon": String(prop) }),
    }
  );
});

import CreateUserForm from "./CreateUserForm";
import EditUserModal from "./EditUserModal";
import UserDetails from "../Pages/Admin/UserDetails";
import userReducer from "../redux/userSlice";
import {
  buildUserRolePayload,
  isDualRoleUser,
  normalizeUserAccess,
} from "../Utils/auth";
import { getUserColumns } from "./SmartTable/tableColumns";

const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
    },
  });

const openSelectByText = (container, textRegex) => {
  const matches = screen.getAllByText(textRegex);
  const trigger = matches.find((el) => el.closest("[class*='cursor-pointer']") || el.closest("div"));
  fireEvent.click(trigger || matches[0]);
};

describe("OT treated strictly as an Observer special privilege (not a role)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { message: "ok" } });
    mockPut.mockResolvedValue({ data: { message: "ok", data: {} } });
    mockGet.mockResolvedValue({ data: { data: [] } });
  });

  test("auth helpers and Users table columns separate roles from the OT Observer privilege", () => {
    expect(normalizeUserAccess("OT")).toBe("Observer");
    expect(normalizeUserAccess("Teacher")).toBe("Teacher");
    expect(isDualRoleUser({ access: "Observer", isDualRole: true })).toBe(true);
    expect(isDualRoleUser({ access: "OT", isDualRole: false })).toBe(true);
    expect(isDualRoleUser({ access: "Teacher", isDualRole: true })).toBe(false);
    expect(isDualRoleUser({ access: "Superadmin", isDualRole: true })).toBe(false);

    expect(
      buildUserRolePayload({
        access: "Teacher",
        isDualRole: true,
        canAddNotebookComment: true,
      })
    ).toEqual({
      access: "Teacher",
      isDualRole: false,
      canAddNotebookComment: false,
      roles: ["Teacher"],
    });

    const columns = getUserColumns({});
    const accessCol = columns.find((col) => col.key === "access");
    expect(accessCol.filterConfig.options).toEqual([
      "Superadmin",
      "Observer",
      "Teacher",
      "OT (Privilege)",
    ]);
    expect(accessCol.filterConfig.options).not.toContain("OT");

    const otObserver = { access: "Observer", isDualRole: true };
    const legacyOt = { access: "OT" };
    expect(accessCol.filterConfig.matchFn(otObserver, ["Observer"])).toBe(true);
    expect(accessCol.filterConfig.matchFn(otObserver, ["OT (Privilege)"])).toBe(true);
    expect(accessCol.filterConfig.matchFn(legacyOt, ["Observer"])).toBe(true);
  });

  test("CreateUserForm removes OT from Role select and sends OT only as Observer privilege", async () => {
    const store = makeStore();
    const onOk = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <CreateUserForm onOk={onOk} onCancel={jest.fn()} />
      </Provider>
    );

    openSelectByText(container, /^Observer$/);
    expect(screen.queryByText(/OT \(Dual Role\)/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^Teacher$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Superadmin$/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText("e.g. EMP001"), {
      target: { value: "EMP900" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter full name"), {
      target: { value: "Anita Sharma" },
    });
    fireEvent.change(screen.getByPlaceholderText("user@dlps.co.in"), {
      target: { value: "anita@dlws.edu.in" },
    });
    fireEvent.change(screen.getByPlaceholderText("10-digit mobile number"), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create secure password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Senior PGT Mathematics"), {
      target: { value: "Coordinator" },
    });

    // Enable the Observer OT privilege switch
    expect(screen.getByText(/OT Privilege \(Observer \+ Teacher\)/i)).toBeInTheDocument();
    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);

    fireEvent.click(screen.getByRole("button", { name: /Create User/i }));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    const submittedPayload = mockPost.mock.calls[0][1];
    expect(submittedPayload.access).toBe("Observer");
    expect(submittedPayload.isDualRole).toBe(true);
    expect(submittedPayload.roles).toEqual(["Observer", "Teacher"]);
  });

  test("CreateUserForm clears OT privilege when switching Role from Observer to Teacher", async () => {
    const store = makeStore();
    const { container } = render(
      <Provider store={store}>
        <CreateUserForm onOk={jest.fn()} onCancel={jest.fn()} />
      </Provider>
    );

    // Enable OT privilege while Observer is active
    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);

    // Switch role to Teacher
    openSelectByText(container, /^Observer$/);
    fireEvent.click(screen.getByText(/^Teacher$/));

    await waitFor(() => {
      expect(screen.queryByText(/OT Privilege \(Observer \+ Teacher\)/i)).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. EMP001"), {
      target: { value: "EMP901" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter full name"), {
      target: { value: "Rahul Verma" },
    });
    fireEvent.change(screen.getByPlaceholderText("user@dlps.co.in"), {
      target: { value: "rahul@dlws.edu.in" },
    });
    fireEvent.change(screen.getByPlaceholderText("10-digit mobile number"), {
      target: { value: "9876543211" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create secure password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Senior PGT Mathematics"), {
      target: { value: "TGT Science" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create User/i }));

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    const submittedPayload = mockPost.mock.calls[0][1];
    expect(submittedPayload.access).toBe("Teacher");
    expect(submittedPayload.isDualRole).toBe(false);
    expect(submittedPayload.roles).toEqual(["Teacher"]);
  });

  test("EditUserModal removes OT from Role select and migrates legacy OT user to Observer + privilege", async () => {
    const store = makeStore();
    const legacyUser = {
      _id: "user_1",
      employeeId: "EMP100",
      name: "Meera Kapoor",
      email: "meera@dlws.edu.in",
      mobile: "9999988888",
      designation: "Wing Coordinator",
      access: "OT",
      isDualRole: false,
      isActive: true,
    };

    const onSuccess = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <EditUserModal open user={legacyUser} onCancel={jest.fn()} onSuccess={onSuccess} />
      </Provider>
    );

    // Normalized to Observer in UI with OT privilege switch shown
    await waitFor(() => {
      expect(screen.getByText(/OT Privilege \(Observer \+ Teacher\)/i)).toBeInTheDocument();
    });

    openSelectByText(container, /^Observer$/);
    expect(screen.queryByText(/OT \(Dual Role\)/i)).not.toBeInTheDocument();

    // Save without changing dropdown -> migrates legacy "OT" access to "Observer" + isDualRole: true
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const putPayload = mockPut.mock.calls[0][1];
    expect(putPayload.access).toBe("Observer");
    expect(putPayload.isDualRole).toBe(true);
    expect(putPayload.roles).toEqual(["Observer", "Teacher"]);
  });

  test("UserDetails displays legacy OT user as Observer with OT privilege and clears privilege if changed to Teacher", async () => {
    const store = makeStore();
    mockGet.mockResolvedValueOnce({
      data: {
        _id: "user_2",
        employeeId: "EMP200",
        name: "Sonia Nair",
        email: "sonia@dlws.edu.in",
        mobile: "9988776655",
        designation: "Primary Coordinator",
        access: "OT",
        isDualRole: false,
        canAddNotebookComment: true,
        isActive: true,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/users/user_2"]}>
          <Routes>
            <Route path="/users/:id" element={<UserDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Observer (OT Privilege)")).toBeInTheDocument();
    });
    expect(screen.getByText("OT Privilege Enabled")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));
    openSelectByText(container, /^Observer$/);
    expect(screen.queryByText(/OT \(Dual Role\)/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/^Teacher$/));

    await waitFor(() => {
      expect(screen.queryByText(/OT Privilege \(Dual Role\)/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Edit Profile/i })).toBeInTheDocument()
    );
    const putPayload = mockPut.mock.calls[0][1];
    expect(putPayload.access).toBe("Teacher");
    expect(putPayload.isDualRole).toBe(false);
    expect(putPayload.canAddNotebookComment).toBe(false);
    expect(putPayload.roles).toEqual(["Teacher"]);
  });
});
