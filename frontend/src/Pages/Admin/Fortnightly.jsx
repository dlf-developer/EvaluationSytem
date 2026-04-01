import React, { useEffect, useMemo } from "react";
import { Button, Box, Flex, Heading, Text, Stack } from "@chakra-ui/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GetAllFormsForAdmin } from "../../redux/Form/fortnightlySlice";
import { UserRole } from "../../config/config";
import { getUserId, getAllTimes } from "../../Utils/auth";
import SmartTable from "../../Components/SmartTable";
import Reminder from "../../Components/Reminder";

const Fortnightly = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Role = getUserId().access;
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUserRole = getUserId()?.access;

  const CombinedData = useSelector((state) => state?.Forms?.getAllForms || []);
  const loading = useSelector((state) => state?.Forms?.loading || false);

  useEffect(() => {
    dispatch(GetAllFormsForAdmin());
  }, [dispatch]);

  // ── Column definitions with filterConfig ──────────────────────
  const columns = useMemo(
    () => [
      {
        title: "Teacher",
        key: "teacherName",
        dataIndex: "teacherID",
        width: "160px",
        sortable: true,
        sorter: (a, b) => {
          const aName = a?.teacherID?.name || a?.userId?.name || "";
          const bName = b?.teacherID?.name || b?.userId?.name || "";
          return aName.localeCompare(bName);
        },
        render: (val, record) => (
          <Text fontWeight="500" fontSize="sm" color="brand.text">
            {val?.name || record?.userId?.name || "—"}
          </Text>
        ),
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
        width: "160px",
        sortable: true,
        sorter: (a, b) => {
          const aName = a?.coordinatorID?.name || a?.userId?.name || "";
          const bName = b?.coordinatorID?.name || b?.userId?.name || "";
          return aName.localeCompare(bName);
        },
        render: (val, record) => (
          <Text fontSize="sm" color="gray.600">
            {val?.name || record?.userId?.name || "—"}
          </Text>
        ),
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
          options: [...new Set(CombinedData.map((r) => r.className).filter(Boolean))],
        },
      },
      {
        title: "Section",
        key: "section",
        dataIndex: "section",
        width: "90px",
        sortable: true,
        render: (val) => <Text fontSize="sm">{val || "—"}</Text>,
        filterConfig: {
          type: "select",
          options: [...new Set(CombinedData.map((r) => r.section).filter(Boolean))],
        },
      },
      {
        title: "Date",
        key: "date",
        dataIndex: "date",
        width: "120px",
        sortable: true,
        render: (val) => (
          <Text fontSize="sm" color="gray.600">
            {val ? getAllTimes(val)?.formattedDate2 : "—"}
          </Text>
        ),
        filterConfig: {
          type: "date",
          matchFn: (record, val) => {
            if (!val) return true;
            const recDate = new Date(record.date).toDateString();
            const filterDate = new Date(val).toDateString();
            return recDate === filterDate;
          },
        },
      },
      {
        title: "Teacher Status",
        key: "isTeacherComplete",
        dataIndex: "isTeacherComplete",
        width: "140px",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CombinedData, currentUserRole]
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
        pageSize={10}
      />
    </Box>
  );
};

export default Fortnightly;
