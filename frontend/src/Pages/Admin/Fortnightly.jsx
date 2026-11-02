import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Button, Box, Flex, Heading, Text, Stack } from "@chakra-ui/react";
import { PlusCircleOutlined } from "../../Components/UI/Icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GetAllFormsForAdmin } from "../../redux/Form/fortnightlySlice";
import { UserRole } from "../../config/config";
import { getUserId, getAllTimes } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import { UserRoleBadge, UserCell } from "../../Components/SmartTable/tableColumns";
import Reminder from "../../Components/Reminder";
import { axiosInstanceToken } from "../../redux/instence";

const Fortnightly = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId()?.access;
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUserRole = Role;

  const { getAllAdminForms, getAllForms, loading, pagination, filterOptions } =
    useSelector((state) => state?.Forms) || {};
  const CombinedData = getAllAdminForms?.length ? getAllAdminForms : (getAllForms || []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serverFilters, setServerFilters] = useState({});

  const lastFetchedParamsRef = useRef("");

  const fetchFortnightlyData = useCallback(
    (currentPage = page, currentLimit = pageSize, activeFilters = serverFilters) => {
      const params = {
        page: currentPage,
        limit: currentLimit,
        skip: (currentPage - 1) * currentLimit,
      };
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
        activeFilters.isCoordinatorComplete !== undefined &&
        activeFilters.isCoordinatorComplete !== null &&
        activeFilters.isCoordinatorComplete !== ""
      ) {
        params.isCoordinatorComplete = activeFilters.isCoordinatorComplete;
      }

      const paramKey = JSON.stringify(params);
      if (lastFetchedParamsRef.current === paramKey) return;
      lastFetchedParamsRef.current = paramKey;

      dispatch(GetAllFormsForAdmin(params));
    },
    [dispatch, page, pageSize, serverFilters]
  );

  useEffect(() => {
    fetchFortnightlyData(page, pageSize, serverFilters);
  }, [fetchFortnightlyData, page, pageSize, serverFilters]);

  const handlePageChange = useCallback(
    (newPage, newSize) => {
      const nextLimit = newSize || pageSize;
      setPage(newPage);
      if (newSize && newSize !== pageSize) {
        setPageSize(newSize);
      }
      fetchFortnightlyData(newPage, nextLimit, serverFilters);
    },
    [fetchFortnightlyData, pageSize, serverFilters]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setServerFilters(newFilters);
      setPage(1);
      fetchFortnightlyData(1, pageSize, newFilters);
    },
    [fetchFortnightlyData, pageSize]
  );

  const handleFetchAllForExport = useCallback(async () => {
    const params = { limit: "all" };
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
      serverFilters.isCoordinatorComplete !== undefined &&
      serverFilters.isCoordinatorComplete !== null &&
      serverFilters.isCoordinatorComplete !== ""
    ) {
      params.isCoordinatorComplete = serverFilters.isCoordinatorComplete;
    }

    const response = await axiosInstanceToken.get(
      "/form/fortnightly-monitor/get/all",
      { params }
    );
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }, [serverFilters]);

  // ── Column definitions with filterConfig ──────────────────────
  const columns = useMemo(
    () => [
      {
        title: "Teacher",
        key: "teacherName",
        dataIndex: "teacherID",
        width: "250px",
        minWidth: "220px",
        sortable: true,
        sorter: (a, b) => {
          const aName = a?.teacherID?.name || a?.userId?.name || "";
          const bName = b?.teacherID?.name || b?.userId?.name || "";
          return aName.localeCompare(bName);
        },
        render: (val, record) => {
          const userObj = val || record?.userId;
          return <UserCell name={userObj?.name} user={userObj} color="brand.text" fontWeight="500" />;
        },
        filterConfig: {
          type: "select",
          options: [
            ...new Set(
              CombinedData.map(
                (r) => r?.teacherID?.name || r?.userId?.name
              ).filter(Boolean)
            ),
          ],
          matchFn: (record, vals) =>
            vals.includes(
              record?.teacherID?.name || record?.userId?.name || ""
            ),
        },
      },
      {
        title: "Observer",
        key: "observerName",
        dataIndex: "coordinatorID",
        width: "250px",
        minWidth: "220px",
        sortable: true,
        sorter: (a, b) => {
          const aName = a?.coordinatorID?.name || a?.userId?.name || "";
          const bName = b?.coordinatorID?.name || b?.userId?.name || "";
          return aName.localeCompare(bName);
        },
        render: (val, record) => {
          const userObj = val || record?.userId;
          return <UserCell name={userObj?.name} user={userObj} color="gray.600" />;
        },
        filterConfig: {
          type: "select",
          options: [
            ...new Set(
              CombinedData.map(
                (r) => r?.coordinatorID?.name || r?.userId?.name
              ).filter(Boolean)
            ),
          ],
          matchFn: (record, vals) =>
            vals.includes(
              record?.coordinatorID?.name || record?.userId?.name || ""
            ),
        },
      },
      {
        title: "Class",
        key: "className",
        dataIndex: "className",
        width: "120px",
        sortable: true,
        render: (val) => <Text fontSize="sm">{val || "—"}</Text>,
        filterConfig: {
          type: "select",
          options: filterOptions?.classes?.length
            ? filterOptions.classes
            : [...new Set(CombinedData.map((r) => r?.className).filter(Boolean))],
          matchFn: (record, vals) => vals.includes(record?.className || ""),
        },
      },
      {
        title: "Section",
        key: "section",
        dataIndex: "section",
        width: "100px",
        sortable: true,
        render: (val) => <Text fontSize="sm">{val || "—"}</Text>,
        filterConfig: {
          type: "select",
          options: filterOptions?.sections?.length
            ? filterOptions.sections
            : [...new Set(CombinedData.map((r) => r?.section).filter(Boolean))],
          matchFn: (record, vals) => vals.includes(record?.section || ""),
        },
      },
      {
        title: "Observation Date",
        key: "observationDate",
        dataIndex: "date",
        width: "160px",
        sortable: true,
        sorter: (a, b) => new Date(a?.date) - new Date(b?.date),
        render: (val) => (
          <Text fontSize="sm" color="gray.600">
            {getAllTimes(val)?.formattedDate2 || "—"}
          </Text>
        ),
        filterConfig: {
          type: "date",
          matchFn: (record, val) =>
            !val ||
            new Date(record?.date).toDateString() ===
              new Date(val).toDateString(),
        },
      },
      {
        title: "Teacher Status",
        key: "isTeacherComplete",
        dataIndex: "isTeacherComplete",
        width: "145px",
        render: (val) => (
          <Box
            display="inline-flex"
            alignItems="center"
            px={2.5}
            py={0.5}
            borderRadius="full"
            bg={val ? "green.50" : "orange.50"}
            border="1px solid"
            borderColor={val ? "green.200" : "orange.200"}
          >
            <Text
              fontSize="xs"
              fontWeight="600"
              color={val ? "green.700" : "orange.600"}
            >
              {val ? "Completed" : "Pending"}
            </Text>
          </Box>
        ),
        filterConfig: {
          type: "boolean",
          trueLabel: "Completed",
          falseLabel: "Pending",
        },
      },
      {
        title: "Observer Status",
        key: "isCoordinatorComplete",
        dataIndex: "isCoordinatorComplete",
        width: "145px",
        render: (val) => (
          <Box
            display="inline-flex"
            alignItems="center"
            px={2.5}
            py={0.5}
            borderRadius="full"
            bg={val ? "green.50" : "orange.50"}
            border="1px solid"
            borderColor={val ? "green.200" : "orange.200"}
          >
            <Text
              fontSize="xs"
              fontWeight="600"
              color={val ? "green.700" : "orange.600"}
            >
              {val ? "Completed" : "Pending"}
            </Text>
          </Box>
        ),
        filterConfig: {
          type: "boolean",
          trueLabel: "Completed",
          falseLabel: "Pending",
        },
      },
      {
        title: "Action",
        key: "action",
        dataIndex: "action",
        width: "180px",
        render: (_, record) => {
          const { isTeacherComplete, isCoordinatorComplete, isObserverInitiation } = record;

          if (isTeacherComplete && isCoordinatorComplete) {
            return (
              <Flex gap={1}>
                <Link to={`/fortnightly-monitor/report/${record._id}`}>
                  <button className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors">
                    View Report
                  </button>
                </Link>
                <Link to={`/fortnightly-monitor/edit/${record._id}`}>
                  <button className="text-nowrap px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors">
                    Edit
                  </button>
                </Link>
              </Flex>
            );
          }
          if (
            currentUserRole === UserRole[1] &&
            !isTeacherComplete &&
            !isCoordinatorComplete &&
            !isObserverInitiation
          ) {
            return <Reminder id={record?._id} />;
          }
          if (
            currentUserRole === UserRole[2] &&
            !isTeacherComplete &&
            !isCoordinatorComplete &&
            isObserverInitiation
          ) {
            return (
              <Link to={`/fortnightly-monitor/create/${record._id}`}>
                <button className="text-nowrap px-3 py-1 text-blue-600 hover:text-blue-900 rounded-md text-sm font-medium transition-colors">
                  Continue Form
                </button>
              </Link>
            );
          }
          if (currentUserRole === UserRole[2] && isTeacherComplete && !isCoordinatorComplete) {
            return (
              <Flex gap={1} align="center">
                <Reminder id={record?._id} />
                <Link to={`/fortnightly-monitor/edit/${record._id}`}>
                  <button className="text-nowrap px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors">
                    Edit
                  </button>
                </Link>
              </Flex>
            );
          }
          if (
            currentUserRole === UserRole[1] &&
            isTeacherComplete &&
            !isCoordinatorComplete
          ) {
            return (
              <Link to={`/fortnightly-monitor/create/${record._id}`}>
                <button className="text-nowrap px-3 py-1 text-blue-600 hover:text-blue-900 rounded-md text-sm font-medium transition-colors">
                  Continue Form
                </button>
              </Link>
            );
          }
          if (
            (currentUserRole === UserRole[1] && !isTeacherComplete && isObserverInitiation) ||
            (currentUserRole === UserRole[1] && !isTeacherComplete && isCoordinatorComplete)
          ) {
            return <Reminder id={record?._id} />;
          }
          return null;
        },
      },
    ],
    [CombinedData, currentUserRole, filterOptions]
  );

  // ── Sort: incomplete forms first ──────────────────────────────
  const sortedData = useMemo(
    () =>
      [...CombinedData].sort((a, b) =>
        a.isTeacherComplete === b.isTeacherComplete
          ? 0
          : a.isTeacherComplete
          ? 1
          : -1
      ),
    [CombinedData]
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {/* ── Page Header ─── */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Fortnightly Monitoring
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Click any column header to filter or sort records.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {Role === UserRole[2] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/fortnightly-monitor/create")}
              px={6}
            >
              New Form
            </Button>
          )}
          {Role === UserRole[1] && currentPath !== "/reports" && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              onClick={() => navigate("/fortnightly-monitor/form-initiation")}
              px={6}
            >
              Form Initiation
            </Button>
          )}
        </Stack>
      </Flex>

      {/* ── Smart Table ─── */}
      <SmartTable
        title="All Forms"
        columns={columns}
        data={sortedData}
        loading={loading}
        rowKey="_id"
        pageSize={pageSize}
        serverSide={true}
        pagination={pagination}
        totalRecords={pagination?.total || 0}
        page={page}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onFetchAllForExport={handleFetchAllForExport}
        downloadable={true}
        downloadFileName="fortnightly_monitor"
      />
    </Box>
  );
};

export default Fortnightly;
