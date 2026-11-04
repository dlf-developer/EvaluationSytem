import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Button, useToast } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getNootbookForms } from "../../redux/Form/noteBookSlice";
import { getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import SmartTable from "../../Components/SmartTable";
import { getNotebookColumns } from "../../Components/SmartTable/tableColumns";
import { axiosInstanceToken } from "../../redux/instence";

function NoteBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = getUserId();
  const Role = user?.access;
  const currentUserRole = Role;

  const { GetForms2, pagination, filterOptions, isLoading } = useSelector((state) => state?.notebook) || {};

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });

  const lastFetchedParamsRef = useRef("");

  // Fetch data with server-side limit, skip, and filters
  const fetchNotebookData = useCallback(
    (
      currentPage = page,
      currentLimit = pageSize,
      activeFilters = serverFilters,
      activeSort = serverSort
    ) => {
      const params = {
        page: currentPage,
        limit: currentLimit,
        skip: (currentPage - 1) * currentLimit,
      };
      if (activeSort?.key && activeSort?.direction) {
        params.sortBy = activeSort.key;
        params.sortOrder = activeSort.direction;
      }
      if (activeFilters.className) {
        params.className = Array.isArray(activeFilters.className)
          ? activeFilters.className.join(",")
          : activeFilters.className;
      }
      if (activeFilters.section) {
        params.section = Array.isArray(activeFilters.section)
          ? activeFilters.section.join(",")
          : activeFilters.section;
      }
      if (activeFilters.subject) {
        params.subject = Array.isArray(activeFilters.subject)
          ? activeFilters.subject.join(",")
          : activeFilters.subject;
      }
      if (activeFilters.teacherName) {
        params.teacherName = Array.isArray(activeFilters.teacherName)
          ? activeFilters.teacherName.join(",")
          : activeFilters.teacherName;
      }
      if (activeFilters.observerName) {
        params.observerName = Array.isArray(activeFilters.observerName)
          ? activeFilters.observerName.join(",")
          : activeFilters.observerName;
      }
      if (activeFilters.personName) {
        params.searchName = Array.isArray(activeFilters.personName)
          ? activeFilters.personName.join(",")
          : activeFilters.personName;
      }
      if (activeFilters.observationDate) {
        params.date = activeFilters.observationDate;
      }
      if (
        activeFilters.isTeacherComplete !== undefined &&
        activeFilters.isTeacherComplete !== null &&
        activeFilters.isTeacherComplete !== ""
      ) {
        params.isTeacherComplete = activeFilters.isTeacherComplete;
      }
      if (
        activeFilters.isObserverComplete !== undefined &&
        activeFilters.isObserverComplete !== null &&
        activeFilters.isObserverComplete !== ""
      ) {
        params.isObserverComplete = activeFilters.isObserverComplete;
      }
      if (
        activeFilters.isReflation !== undefined &&
        activeFilters.isReflation !== null &&
        activeFilters.isReflation !== ""
      ) {
        params.isReflation = activeFilters.isReflation;
      }

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(getNootbookForms(params));
    },
    [dispatch, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchNotebookData(page, pageSize, serverFilters, serverSort);
  }, [fetchNotebookData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchNotebookData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchNotebookData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchNotebookData(1, pageSize, newFilters, serverSort);
    },
    [fetchNotebookData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchNotebookData(1, pageSize, serverFilters, newSort);
    },
    [fetchNotebookData, pageSize, serverFilters]
  );

  // Fetch all filtered records from the server for standard or custom Excel export
  const handleFetchAllForExport = useCallback(async () => {
    const params = {
      limit: "all",
    };
    if (serverFilters.className) {
      params.className = Array.isArray(serverFilters.className)
        ? serverFilters.className.join(",")
        : serverFilters.className;
    }
    if (serverFilters.section) {
      params.section = Array.isArray(serverFilters.section)
        ? serverFilters.section.join(",")
        : serverFilters.section;
    }
    if (serverFilters.subject) {
      params.subject = Array.isArray(serverFilters.subject)
        ? serverFilters.subject.join(",")
        : serverFilters.subject;
    }
    if (serverFilters.teacherName) {
      params.teacherName = Array.isArray(serverFilters.teacherName)
        ? serverFilters.teacherName.join(",")
        : serverFilters.teacherName;
    }
    if (serverFilters.observerName) {
      params.observerName = Array.isArray(serverFilters.observerName)
        ? serverFilters.observerName.join(",")
        : serverFilters.observerName;
    }
    if (serverFilters.personName) {
      params.searchName = Array.isArray(serverFilters.personName)
        ? serverFilters.personName.join(",")
        : serverFilters.personName;
    }
    if (serverFilters.observationDate) {
      params.date = serverFilters.observationDate;
    }
    if (
      serverFilters.isTeacherComplete !== undefined &&
      serverFilters.isTeacherComplete !== null &&
      serverFilters.isTeacherComplete !== ""
    ) {
      params.isTeacherComplete = serverFilters.isTeacherComplete;
    }
    if (
      serverFilters.isObserverComplete !== undefined &&
      serverFilters.isObserverComplete !== null &&
      serverFilters.isObserverComplete !== ""
    ) {
      params.isObserverComplete = serverFilters.isObserverComplete;
    }
    if (
      serverFilters.isReflation !== undefined &&
      serverFilters.isReflation !== null &&
      serverFilters.isReflation !== ""
    ) {
      params.isReflation = serverFilters.isReflation;
    }

    const response = await axiosInstanceToken.get(
      "notebook-checking-proforma/get-all",
      { params }
    );
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [serverFilters]);

  const columns = useMemo(() => {
    const baseCols = getNotebookColumns({
      data: GetForms2 || [],
      currentUserRole,
    });

    // Enhance dropdown filters with all database options if available from server
    return baseCols.map((col) => {
      if (col.key === "className" && filterOptions?.classes?.length > 0) {
        return {
          ...col,
          filterConfig: {
            ...col.filterConfig,
            options: filterOptions.classes,
          },
        };
      }
      if (col.key === "section" && filterOptions?.sections?.length > 0) {
        return {
          ...col,
          filterConfig: {
            ...col.filterConfig,
            options: filterOptions.sections,
          },
        };
      }
      return col;
    });
  }, [GetForms2, currentUserRole, filterOptions]);

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage, filter, and review all notebook checking evaluations.
          </Text>
        </Box>

        {Role === UserRole[2] && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={() => navigate("/NoteBook-checking-proforma/create")}
            px={6}
          >
            Fill New Form
          </Button>
        )}
      </Flex>

      <SmartTable
        title="All Notebook Forms"
        columns={columns}
        data={GetForms2 || []}
        loading={isLoading}
        rowKey="_id"
        pageSize={pageSize}
        serverSide={true}
        pagination={pagination}
        totalRecords={pagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable={true}
        downloadFileName="notebook_checking_proforma"
      />
    </Box>
  );
}

export default NoteBook;
