import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFrom, deleteWeekly4Form } from "../../redux/userSlice";
import { axiosInstanceToken } from "../../redux/instence";
import { UserRole } from "../../config/config";
import { getUserId } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { message, Modal } from "../../Components/UI";
import { getWeeklyColumns } from "../../Components/SmartTable/tableColumns";

function Weely4Page() {
  const dispatch = useDispatch();
  const currentUserRole = getUserId()?.access;

  const CombinedData = useSelector((state) => state?.user?.getAllWeeklyFroms || []);
  const loading = useSelector((state) => state?.user?.loading || false);
  const weeklyPagination = useSelector((state) => state?.user?.weeklyPagination);

  // ── Server-Side Pagination & Filtering State ──────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});
  const [serverSort, setServerSort] = useState({ key: null, direction: null });
  const lastFetchedParamsRef = useRef("");

  const fetchWeeklyData = useCallback(
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
      if (activeFilters.dateOfSubmission) {
        params.dateOfSubmission = activeFilters.dateOfSubmission;
      }
      if (activeFilters.date) {
        params.date = activeFilters.date;
      }
      if (
        activeFilters.isCompleted !== undefined &&
        activeFilters.isCompleted !== null &&
        activeFilters.isCompleted !== ""
      ) {
        params.isCompleted = activeFilters.isCompleted;
      }

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(getAllWeeklyFrom(params));
    },
    [dispatch, page, pageSize, serverFilters, serverSort]
  );

  useEffect(() => {
    fetchWeeklyData(page, pageSize, serverFilters, serverSort);
  }, [fetchWeeklyData, page, pageSize, serverFilters, serverSort]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchWeeklyData(newPage, nextLimit, serverFilters, serverSort);
    },
    [fetchWeeklyData, pageSize, serverFilters, serverSort]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchWeeklyData(1, pageSize, newFilters, serverSort);
    },
    [fetchWeeklyData, pageSize, serverSort]
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setServerSort(newSort);
      setPage(1);
      fetchWeeklyData(1, pageSize, serverFilters, newSort);
    },
    [fetchWeeklyData, pageSize, serverFilters]
  );

  const handleFetchAllForExport = useCallback(async () => {
    const params = { limit: "all" };
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
    if (serverFilters.dateOfSubmission) {
      params.dateOfSubmission = serverFilters.dateOfSubmission;
    }
    if (serverFilters.date) {
      params.date = serverFilters.date;
    }
    if (
      serverFilters.isCompleted !== undefined &&
      serverFilters.isCompleted !== null &&
      serverFilters.isCompleted !== ""
    ) {
      params.isCompleted = serverFilters.isCompleted;
    }

    const response = await axiosInstanceToken.get(`/weekly4Forms`, { params });
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [serverFilters]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this form?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await dispatch(deleteWeekly4Form(id)).unwrap();
          if (res?.success || res?.message) {
            message.success("Form deleted successfully");
            lastFetchedParamsRef.current = "";
            fetchWeeklyData(page, pageSize, serverFilters);
          } else {
            message.error("Failed to delete form");
          }
        } catch (error) {
          message.error("An error occurred while deleting");
        }
      },
    });
  };

  const columns = useMemo(
    () => getWeeklyColumns({ data: CombinedData, currentUserRole, onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Weekly 4 Form
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and view weekly assessment forms.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {currentUserRole === UserRole[2] && (
            <Link to="/weekly4form/create">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                Fill New Form
              </Button>
            </Link>
          )}
          {currentUserRole === UserRole[1] && (
            <Link to="/weekly4form/create?Initiate=true">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                px={6}
              >
                Form Initiation
              </Button>
            </Link>
          )}
        </Stack>
      </Flex>

      <SmartTable
        title="All Weekly Forms"
        columns={columns}
        data={CombinedData}
        loading={loading}
        rowKey="_id"
        pageSize={pageSize}
        serverSide={true}
        pagination={weeklyPagination}
        totalRecords={weeklyPagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable={true}
        downloadFileName="weekly4_forms"
      />
    </Box>
  );
}

export default Weely4Page;
