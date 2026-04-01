import { useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

const useTableState = ({ data = [], columns = [], pageSize: initialPageSize = 10 }) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [sortState, setSortState] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const getColumnByKey = useCallback(
    (key) => columns.find((c) => c.key === key),
    [columns]
  );

  // ── Filtering ────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let result = [...data];

    Object.entries(activeFilters).forEach(([key, filterValue]) => {
      if (filterValue === null || filterValue === undefined) return;
      if (Array.isArray(filterValue) && filterValue.length === 0) return;
      if (filterValue === "") return;

      const col = getColumnByKey(key);
      if (!col?.filterConfig) return;

      const { type, matchFn } = col.filterConfig;

      result = result.filter((record) => {
        if (matchFn) return matchFn(record, filterValue);

        const rawVal = record[col.dataIndex];

        if (type === "select") {
          return filterValue.includes(String(rawVal));
        }
        if (type === "text") {
          return String(rawVal || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
        if (type === "date") {
          return dayjs(rawVal).isSame(dayjs(filterValue), "day");
        }
        if (type === "boolean") {
          return !!rawVal === filterValue;
        }
        return true;
      });
    });

    return result;
  }, [data, activeFilters, getColumnByKey]);

  // ── Sorting ──────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) return filteredData;

    const col = getColumnByKey(sortState.key);
    if (!col) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      if (col.sorter) return col.sorter(a, b);

      const aVal = a[col.dataIndex];
      const bVal = b[col.dataIndex];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Date-like strings
      const aDate = dayjs(aVal);
      const bDate = dayjs(bVal);
      if (aDate.isValid() && bDate.isValid() && typeof aVal === "string" && aVal.includes("-")) {
        return aDate.unix() - bDate.unix();
      }

      if (typeof aVal === "string") return aVal.localeCompare(bVal);
      return Number(aVal) - Number(bVal);
    });

    return sortState.direction === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, sortState, getColumnByKey]);

  // ── Pagination ───────────────────────────────────────────────
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleFilterClear = useCallback((key) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortState((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  const handlePageChange = useCallback((page, size) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSortState({ key: null, direction: null });
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = Object.entries(activeFilters).some(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== "";
  });

  return {
    displayData: paginatedData,
    allFilteredData: sortedData,   // full filtered+sorted dataset (for download)
    totalFiltered: sortedData.length,
    activeFilters,
    sortState,
    currentPage,
    pageSize,
    handleFilterChange,
    handleFilterClear,
    handleSort,
    handlePageChange,
    clearAllFilters,
    hasActiveFilters,
  };
};

export default useTableState;
