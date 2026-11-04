/**
 * sortHelper.js
 * Centralized utility to parse client-side sort parameters into MongoDB sort queries.
 *
 * Supported query formats from client:
 * - req.query.sortBy / sortKey / sort (e.g. "observationDate", "className", "totalScores", "-createdAt")
 * - req.query.sortOrder / sortDir / order ("asc" / "desc" or 1 / -1)
 */

function parseSortParams(query = {}, fieldMap = {}, defaultSort = { createdAt: -1 }) {
  const rawKey = query.sortBy || query.sortKey || query.sort;
  const rawOrder = (query.sortOrder || query.sortDir || query.order || "desc")
    .toString()
    .toLowerCase();
  const dir = rawOrder === "asc" || rawOrder === "1" ? 1 : -1;

  if (!rawKey) {
    return defaultSort;
  }

  let cleanKey = String(rawKey).trim();
  let explicitDir = dir;

  if (cleanKey.startsWith("-")) {
    cleanKey = cleanKey.substring(1);
    explicitDir = -1;
  } else if (cleanKey.startsWith("+")) {
    cleanKey = cleanKey.substring(1);
    explicitDir = 1;
  }

  const targetField = fieldMap[cleanKey] || cleanKey;
  const sortObj = { [targetField]: explicitDir };

  // If sorting on something other than createdAt or _id, add createdAt as tie-breaker
  if (targetField !== "createdAt" && targetField !== "_id") {
    sortObj.createdAt = -1;
  }

  return sortObj;
}

module.exports = { parseSortParams };

