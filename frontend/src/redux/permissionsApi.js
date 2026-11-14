import { axiosInstanceToken as instance } from "./instence";

/**
 * Verify Admin PIN for sensitive management
 * POST /api/permissions/verify-pin
 */
export const verifyAdminPinApi = async (pin) => {
  const res = await instance.post("/permissions/verify-pin", { pin });
  return res?.data;
};

/**
 * Fetch effective permissions for the current user
 * GET /api/permissions/my-permissions
 */
export const fetchMyPermissionsApi = async () => {
  const res = await instance.get("/permissions/my-permissions");
  if (res?.data?.success && res?.data?.data) {
    return res.data.data;
  }
  throw new Error("Failed to load user permissions.");
};

/**
 * Fetch complete permissions matrix (Roles + User overrides)
 * Superadmin only
 * GET /api/permissions/matrix
 */
export const fetchPermissionsMatrixApi = async () => {
  const res = await instance.get("/permissions/matrix");
  if (res?.data?.success && res?.data?.data) {
    return res.data.data;
  }
  throw new Error(res?.data?.message || "Failed to load permissions matrix.");
};

/**
 * Update role-level permissions
 * Superadmin only
 * PUT /api/permissions/role/:roleName
 */
export const updateRolePermissionsApi = async (roleName, payload) => {
  const res = await instance.put(`/permissions/role/${roleName}`, payload);
  if (res?.data?.success) {
    return res.data;
  }
  throw new Error(res?.data?.message || `Failed to update permissions for role ${roleName}.`);
};

/**
 * Update user-level custom override
 * Superadmin only
 * PUT /api/permissions/user/:userId
 */
export const updateUserPermissionsApi = async (userId, payload) => {
  const res = await instance.put(`/permissions/user/${userId}`, payload);
  if (res?.data?.success) {
    return res.data;
  }
  throw new Error(res?.data?.message || "Failed to save user permissions.");
};

/**
 * Reset user override back to role default
 * Superadmin only
 * DELETE /api/permissions/user/:userId
 */
export const resetUserPermissionsApi = async (userId) => {
  const res = await instance.delete(`/permissions/user/${userId}`);
  if (res?.data?.success) {
    return res.data;
  }
  throw new Error(res?.data?.message || "Failed to reset user permissions.");
};
