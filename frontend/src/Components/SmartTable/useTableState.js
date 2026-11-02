import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

const useTableState = ({
  data = [],
  columns = [],
  pageSize: initialPageSize = 10,
  serverSide = false,
  totalRecords = 0,
  page: externalPage,
  pagination = null,
  onPageChange,
  onFilterChange,
  onSortChange,
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [sortState, setSortState] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(
    externalPage || pagination?.page || 1
  );
  const [pageSize, setPageSize] = useState(
    initialPageSize || pagination?.limit || 10
  );

  // Synchronize currentPage only when external props change (not on local state changes)
  const prevExternalPageRef = useRef(externalPage);
  const prevServerPageRef = useRef(pagination?.page);
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== prevExternalPageRef.current) {
      prevExternalPageRef.current = externalPage;
      setCurrentPage(externalPage);
    }
    if (pagination?.page !== undefined && pagination?.page !== prevServerPageRef.current) {
      prevServerPageRef.current = pagination.page;
      setCurrentPage(pagination.page);
    }
  }, [externalPage, pagination?.page]);

  // Synchronize pageSize only when external props change (not on local state changes)
  const prevInitialPageSizeRef = useRef(initialPageSize);
  const prevServerLimitRef = useRef(pagination?.limit);
  useEffect(() => {
    if (initialPageSize !== undefined && initialPageSize !== prevInitialPageSizeRef.current) {
      prevInitialPageSizeRef.current = initialPageSize;
      setPageSize(initialPageSize);
    }
    if (pagination?.limit !== undefined && pagination?.limit !== prevServerLimitRef.current) {
      prevServerLimitRef.current = pagination.limit;
      setPageSize(pagination.limit);
    }
  }, [initialPageSize, pagination?.limit]);

  const getColumnByKey = useCallback(
    (key) => columns.find((c) => c.key === key),
    [columns]
  );

  // ── Filtering ────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (serverSide) {
      return data;
    }

    let result = [...data];

    // Unless this is the Super Admin user table, exclude records belonging to inactive users
    const isUserTable = columns.some((c) => c.key === "employeeId" || c.key === "customId");
    const isInactive = (u) => u && typeof u === "object" && u.isActive === false;

    if (!isUserTable) {
      result = result.filter((record) => {
        if (record?.isActive === false) return false;
        if (isInactive(record?.teacherID)) return false;
        if (isInactive(record?.coordinatorID)) return false;
        if (isInactive(record?.createdBy)) return false;
        if (isInactive(record?.userId)) return false;
        if (isInactive(record?.grenralDetails?.NameoftheVisitingTeacher)) return false;
        if (isInactive(record?.grenralDetails?.NameofObserver)) return false;
        return true;
      });
    }

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
  }, [serverSide, data, activeFilters, getColumnByKey, columns]);

  // ── Sorting ──────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (serverSide) {
      return filteredData;
    }

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
  }, [serverSide, filteredData, sortState, getColumnByKey]);

  // ── Pagination ───────────────────────────────────────────────
  const paginatedData = useMemo(() => {
    if (serverSide) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [serverSide, data, sortedData, currentPage, pageSize]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (serverSide && onFilterChange) {
        onFilterChange(next);
      }
      return next;
    });
    setCurrentPage(1);
    if (serverSide && onPageChange) {
      onPageChange(1, pageSize);
    }
  }, [serverSide, onFilterChange, onPageChange, pageSize]);

  const handleFilterClear = useCallback((key) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      if (serverSide && onFilterChange) {
        onFilterChange(next);
      }
      return next;
    });
    setCurrentPage(1);
    if (serverSide && onPageChange) {
      onPageChange(1, pageSize);
    }
  }, [serverSide, onFilterChange, onPageChange, pageSize]);

  const handleSort = useCallback((key) => {
    setSortState((prev) => {
      const next =
        prev.key !== key
          ? { key, direction: "asc" }
          : prev.direction === "asc"
          ? { key, direction: "desc" }
          : { key: null, direction: null };
      if (serverSide && onSortChange) {
        onSortChange(next);
      }
      return next;
    });
  }, [serverSide, onSortChange]);

  const handlePageChange = useCallback((page, size) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
    if (serverSide && onPageChange) {
      onPageChange(page, size || pageSize);
    }
  }, [serverSide, onPageChange, pageSize]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSortState({ key: null, direction: null });
    setCurrentPage(1);
    if (serverSide && onFilterChange) {
      onFilterChange({});
    }
    if (serverSide && onPageChange) {
      onPageChange(1, pageSize);
    }
  }, [serverSide, onFilterChange, onPageChange, pageSize]);

  const hasActiveFilters = Object.entries(activeFilters).some(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== "";
  });

  const serverTotal =
    pagination?.total !== undefined && pagination?.total !== null
      ? pagination.total
      : totalRecords !== undefined && totalRecords !== null
      ? totalRecords
      : data.length;

  return {
    displayData: paginatedData,
    allFilteredData: sortedData, // full filtered+sorted dataset (for download)
    totalFiltered: serverSide ? serverTotal : sortedData.length,
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
