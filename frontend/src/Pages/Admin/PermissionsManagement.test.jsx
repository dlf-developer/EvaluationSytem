import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PermissionsManagement from "./PermissionsManagement";
import { getUserId } from "../../Utils/auth";
import { isAdminFeaturesUnlocked, setAdminFeaturesUnlocked } from "../../Utils/adminUnlock";
import {
  fetchPermissionsMatrixApi,
  updateRolePermissionsApi,
  updateUserPermissionsApi,
  resetUserPermissionsApi,
} from "../../redux/permissionsApi";
import { PermissionsProvider } from "../../context/PermissionsContext";

jest.mock("../../Utils/auth", () => ({
  getUserId: jest.fn(() => ({ access: "Superadmin", name: "Admin User" })),
}));

jest.mock("../../Utils/adminUnlock", () => ({
  isAdminFeaturesUnlocked: jest.fn(() => true),
  setAdminFeaturesUnlocked: jest.fn(),
}));

jest.mock("../../redux/permissionsApi", () => ({
  fetchPermissionsMatrixApi: jest.fn(),
  updateRolePermissionsApi: jest.fn(),
  updateUserPermissionsApi: jest.fn(),
  resetUserPermissionsApi: jest.fn(),
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

const mockMatrixData = {
  roles: {
    Superadmin: {
      tabs: { "/dashboard": true, "/reports": true, "/users": true, "/audit-logs": true },
      documents: {
        fortnightly: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        wingCoordinator: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        auditLogs: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      },
    },
    Observer: {
      tabs: { "/dashboard": true, "/fortnightly-monitor": true, "/users": false },
      documents: {
        fortnightly: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        wingCoordinator: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        auditLogs: { canView: false, canCreate: false, canEdit: false, canDelete: false },
      },
    },
    Teacher: {
      tabs: { "/dashboard": true, "/profile": true, "/users": false },
      documents: {
        fortnightly: { canView: true, canCreate: false, canEdit: true, canDelete: false },
        wingCoordinator: { canView: false, canCreate: false, canEdit: false, canDelete: false },
      },
    },
  },
  userOverrides: [
    {
      _id: "override1",
      user: { _id: "user123", name: "Ritu Sharma", employeeId: "EMP-101", access: "Teacher", email: "ritu@dlps.co.in" },
      tabs: { "/wing-coordinator": true },
      documents: { wingCoordinator: { canView: true, canCreate: false, canEdit: false, canDelete: false } },
    },
  ],
};

describe("PermissionsManagement Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserId.mockReturnValue({ access: "Superadmin", name: "Admin User" });
    isAdminFeaturesUnlocked.mockReturnValue(true);
    fetchPermissionsMatrixApi.mockResolvedValue(mockMatrixData);
    updateRolePermissionsApi.mockResolvedValue({ success: true });
  });

  test("renders modern Role Permissions Matrix with roles, batch controls and tabs", async () => {
    render(<PermissionsManagement />);

    expect(
      screen.getByRole("heading", { name: "Role & User Permissions Management" })
    ).toBeInTheDocument();

    // Verify role cards
    expect(screen.getByRole("button", { name: /observer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /teacher/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /superadmin/i })).toBeInTheDocument();

    // Wait for matrix data load
    await waitFor(() => {
      expect(screen.getByText(/Document CRUD Privileges for Observer/i)).toBeInTheDocument();
    });

    // Check presets are visible
    expect(screen.getByRole("button", { name: /read-only mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /full access/i })).toBeInTheDocument();
  });

  test("switches active role and updates permissions view", async () => {
    render(<PermissionsManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Document CRUD Privileges for Observer/i)).toBeInTheDocument();
    });

    const superadminBtn = screen.getByRole("button", { name: /superadmin/i });
    fireEvent.click(superadminBtn);

    expect(screen.getByText(/Document CRUD Privileges for Superadmin/i)).toBeInTheDocument();
  });

  test("applies Read-Only preset and triggers dirty state save bar", async () => {
    render(<PermissionsManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Document CRUD Privileges for Observer/i)).toBeInTheDocument();
    });

    const readOnlyPreset = screen.getByRole("button", { name: /read-only mode/i });
    fireEvent.click(readOnlyPreset);

    // Floating action bar should show unsaved changes
    expect(screen.getByText(/You have unsaved permission modifications for/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /save changes for observer/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateRolePermissionsApi).toHaveBeenCalledWith(
        "Observer",
        expect.objectContaining({
          documents: expect.any(Object),
          tabs: expect.any(Object),
        })
      );
    });
  });

  test("switches between Role Matrix and User Overrides tabs", async () => {
    render(<PermissionsManagement />);

    await waitFor(() => {
      expect(fetchPermissionsMatrixApi).toHaveBeenCalled();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    const userTabBtn = screen.getByRole("button", { name: /individual user overrides/i });
    fireEvent.click(userTabBtn);

    expect(screen.getByText("User-Specific Custom Overrides")).toBeInTheDocument();
    expect(screen.getByText("Ritu Sharma")).toBeInTheDocument();
    expect(screen.getByText("EMP-101")).toBeInTheDocument();
  });
});
