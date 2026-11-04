import { axiosInstanceToken } from "../redux/instence";

/**
 * Record a user action in the system audit log.
 * Non-blocking: will never interrupt or disrupt user workflows.
 */
export const recordClientAudit = async ({
  action = "DOWNLOAD",
  module = "General",
  targetId = null,
  details = "",
  changes = [],
}) => {
  try {
    const storedEmail = (localStorage.getItem("userEmail") || "").toLowerCase().trim();
    const payload = {
      action: String(action || "DOWNLOAD").toUpperCase(),
      module: module || "General",
      targetId: targetId ? String(targetId) : null,
      details: details || "",
      changes: Array.isArray(changes) ? changes : [],
      userEmail: storedEmail || undefined,
    };

    // Post to the backend record endpoint
    axiosInstanceToken.post("/audit-logs/record", payload).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[AuditLogger] Client action record warning:", err?.response?.data || err.message);
      }
    });
  } catch (e) {
    // Non-blocking: silently ignore client side recording errors
  }
};

/**
 * Convenience helper specifically for recording file downloads and data exports.
 */
export const recordFileDownloadAudit = ({
  fileName,
  fileType = "Excel (.xlsx)",
  module = "Export",
  rowCount = null,
  columnCount = null,
  extraDetails = "",
}) => {
  const metaParts = [];
  if (fileType) metaParts.push(`Type: ${fileType}`);
  if (rowCount !== null && rowCount !== undefined) metaParts.push(`Rows: ${rowCount}`);
  if (columnCount !== null && columnCount !== undefined) metaParts.push(`Columns: ${columnCount}`);
  if (extraDetails) metaParts.push(extraDetails);

  const metaString = metaParts.length > 0 ? ` (${metaParts.join(" | ")})` : "";
  const details = `Downloaded/Exported file "${fileName}"${metaString}`;

  return recordClientAudit({
    action: "DOWNLOAD",
    module,
    targetId: fileName,
    details,
    changes: [
      { field: "fileName", oldValue: null, newValue: fileName },
      { field: "fileType", oldValue: null, newValue: fileType },
      ...(rowCount !== null && rowCount !== undefined
        ? [{ field: "rowCount", oldValue: null, newValue: rowCount }]
        : []),
      ...(columnCount !== null && columnCount !== undefined
        ? [{ field: "columnCount", oldValue: null, newValue: columnCount }]
        : []),
      ...(extraDetails ? [{ field: "extraDetails", oldValue: null, newValue: extraDetails }] : []),
    ],
  });
};

/**
 * Convenience helper to record viewing/accessing sensitive reports and overviews
 */
export const recordViewAudit = ({
  module = "Report Overview",
  targetId = null,
  details = "",
}) => {
  return recordClientAudit({
    action: "VIEW",
    module,
    targetId,
    details: details || `Viewed ${module}${targetId ? ` (ID: ${targetId})` : ""}`,
  });
};

/**
 * Convenience helper to record role switching for dual-role users
 */
export const recordRoleSwitchAudit = ({ fromRole, toRole, email = "" }) => {
  return recordClientAudit({
    action: "ROLE_SWITCH",
    module: "User Access",
    details: `Switched active role from "${fromRole || "Unknown"}" to "${toRole}"`,
    changes: [{ field: "activeRole", oldValue: fromRole, newValue: toRole }],
  });
};

const auditLogger = {
  recordClientAudit,
  recordFileDownloadAudit,
  recordViewAudit,
  recordRoleSwitchAudit,
};

export default auditLogger;

