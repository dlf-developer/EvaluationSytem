import { axiosInstanceToken as instance } from "./instence";

/**
 * Fetch all best practices from the database.
 * No static seed data — everything comes from the API.
 */
export const fetchAllBestPractices = async () => {
  const res = await instance.get("/best-practices");
  if (res?.data?.success && Array.isArray(res?.data?.data)) {
    return res.data.data;
  }
  throw new Error("Failed to fetch best practices from server.");
};

/**
 * Create a new best practice (Superadmin only).
 * Sends the form data directly to the backend — no localStorage fallback.
 */
export const createBestPracticeApi = async (practiceData) => {
  const res = await instance.post("/best-practices", practiceData);
  if (res?.data?.success && res?.data?.data) {
    return res.data.data;
  }
  throw new Error(res?.data?.message || "Failed to create best practice.");
};

/**
 * Delete a best practice by its numeric id (Superadmin only).
 */
export const deleteBestPracticeApi = async (id) => {
  const res = await instance.delete(`/best-practices/${id}`);
  if (res?.data?.success) {
    return res.data.data;
  }
  throw new Error(res?.data?.message || "Failed to delete best practice.");
};
