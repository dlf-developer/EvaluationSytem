/**
 * tableColumns.js
 * ─────────────────────────────────────────────────────────────────────────
 * Centralized SmartTable column definitions for every table in the app.
 *
 * Each export is a *function* that receives live data / handlers so that
 * `filterConfig.options` are always derived from real records.
 *
 * Import pattern:
 *   import { getFortnightlyColumns } from "./tableColumns";
 * ─────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { Box, Text, Flex, Tag, Stack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { DeleteFilled } from "@ant-design/icons";
import { getAllTimes } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import Reminder from "../Reminder";

// ─── Shared cell helpers ────────────────────────────────────────────────────

const StatusBadge = ({
  value,
  trueLabel = "Completed",
  falseLabel = "Pending",
}) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    px="8px"
    py="3px"
    borderRadius="full"
    bg={value ? "green.50" : "orange.50"}
    border="1px solid"
    borderColor={value ? "green.200" : "orange.200"}
    whiteSpace="nowrap"
    lineHeight="1"
  >
    <Text
      as="span"
      fontSize="11px"
      fontWeight="600"
      color={value ? "green.700" : "orange.600"}
      lineHeight="1"
    >
      {value ? trueLabel : falseLabel}
    </Text>
  </Box>
);

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

// ─────────────────────────────────────────────────────────────────────────────
// 1. FORTNIGHTLY MONITOR — Admin / Observer / Teacher list view
// ─────────────────────────────────────────────────────────────────────────────
export const getFortnightlyColumns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: "Teacher",
    key: "teacherName",
    dataIndex: "teacherID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherID?.name || a?.userId?.name || "").localeCompare(
        b?.teacherID?.name || b?.userId?.name || "",
      ),
    render: (val, record) => (
      <Text fontWeight="500" fontSize="sm">
        {val?.name || record?.userId?.name || "—"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherID?.name || r?.userId?.name)),
      matchFn: (record, vals) =>
        vals.includes(record?.teacherID?.name || record?.userId?.name || ""),
    },
  },
  {
    title: "Observer",
    key: "observerName",
    dataIndex: "coordinatorID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.coordinatorID?.name || a?.userId?.name || "").localeCompare(
        b?.coordinatorID?.name || b?.userId?.name || "",
      ),
    render: (val, record) => (
      <Text fontSize="sm" color="gray.600">
        {val?.name || record?.userId?.name || "—"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.coordinatorID?.name || r?.userId?.name)),
      matchFn: (record, vals) =>
        vals.includes(
          record?.coordinatorID?.name || record?.userId?.name || "",
        ),
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "className",
    width: "110px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r.className)),
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
      options: uniq(data.map((r) => r.section)),
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
      matchFn: (record, val) =>
        !val ||
        new Date(record.date).toDateString() === new Date(val).toDateString(),
    },
  },
  {
    title: "Teacher Status",
    key: "isTeacherComplete",
    dataIndex: "isTeacherComplete",
    width: "140px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "150px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "190px",
    render: (_, record) => {
      const { isTeacherComplete, isCoordinatorComplete, isObserverInitiation } =
        record;
      const renderAction = () => {
        if (isTeacherComplete && isCoordinatorComplete) {
          return (
            <Flex gap={1} align="center">
              <Link to={`/fortnightly-monitor/report/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                  View Report
                </Button>
              </Link>
              <Link to={`/fortnightly-monitor/edit/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="green" fontWeight="medium" flexShrink={0}>
                  Edit
                </Button>
              </Link>
            </Flex>
          );
        }
        if (
          currentUserRole === UserRole[1] &&
          !isTeacherComplete &&
          !isCoordinatorComplete &&
          !isObserverInitiation
        )
          return <Reminder id={record?._id} />;

        if (
          currentUserRole === UserRole[2] &&
          !isTeacherComplete &&
          !isCoordinatorComplete &&
          isObserverInitiation
        )
          return (
            <Link to={`/fortnightly-monitor/create/${record._id}`}>
              <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                Continue Form
              </Button>
            </Link>
          );

        if (
          currentUserRole === UserRole[2] &&
          isTeacherComplete &&
          !isCoordinatorComplete
        )
          return (
            <Flex gap={1} align="center">
              <Reminder id={record?._id} />
              <Link to={`/fortnightly-monitor/edit/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="green" fontWeight="medium" flexShrink={0}>
                  Edit
                </Button>
              </Link>
            </Flex>
          );

        if (
          currentUserRole === UserRole[1] &&
          isTeacherComplete &&
          !isCoordinatorComplete
        )
          return (
            <Link to={`/fortnightly-monitor/create/${record._id}`}>
              <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                Continue Form
              </Button>
            </Link>
          );

        if (
          (currentUserRole === UserRole[1] &&
            !isTeacherComplete &&
            isObserverInitiation) ||
          (currentUserRole === UserRole[1] &&
            !isTeacherComplete &&
            isCoordinatorComplete)
        )
          return <Reminder id={record?._id} />;

        return null;
      };

      return (
        <Flex gap={1} align="center">
          {renderAction()}
          {currentUserRole === UserRole[1] && onDelete && (
            <Button
              size="md"
              variant="outline"
              colorScheme="red"
              px={2}
              flexShrink={0}
              onClick={() => onDelete(record._id)}
              title="Delete"
            >
              <DeleteFilled />
            </Button>
          )}
        </Flex>
      );
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLASSROOM WALKTHROUGH columns
// ─────────────────────────────────────────────────────────────────────────────
export const getClassroomColumns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: currentUserRole === UserRole[2] ? "Observer Name" : "Teacher Name",
    key: "personName",
    dataIndex: "grenralDetails",
    width: "160px",
    sortable: true,
    sorter: (a, b) => {
      const aName =
        currentUserRole === UserRole[2]
          ? a?.createdBy?.name || ""
          : a?.grenralDetails?.NameoftheVisitingTeacher?.name || "";
      const bName =
        currentUserRole === UserRole[2]
          ? b?.createdBy?.name || ""
          : b?.grenralDetails?.NameoftheVisitingTeacher?.name || "";
      return aName.localeCompare(bName);
    },
    render: (val, record) => (
      <Text fontWeight="500" fontSize="sm">
        {currentUserRole === UserRole[2]
          ? record?.createdBy?.name
          : val?.NameoftheVisitingTeacher?.name || "—"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(
        data.map((r) =>
          currentUserRole === UserRole[2]
            ? r?.createdBy?.name
            : r?.grenralDetails?.NameoftheVisitingTeacher?.name,
        ),
      ),
      matchFn: (record, vals) => {
        const name =
          currentUserRole === UserRole[2]
            ? record?.createdBy?.name
            : record?.grenralDetails?.NameoftheVisitingTeacher?.name;
        return vals.includes(name || "");
      },
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.className || "").localeCompare(
        b?.grenralDetails?.className || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.className || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.className)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.className || ""),
    },
  },
  {
    title: "Section",
    key: "section",
    dataIndex: "grenralDetails",
    width: "90px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.Section || "").localeCompare(
        b?.grenralDetails?.Section || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.Section || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Section)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Section || ""),
    },
  },
  {
    title: "Subject",
    key: "subject",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.Subject || "").localeCompare(
        b?.grenralDetails?.Subject || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.Subject || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Subject)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Subject || ""),
    },
  },
  {
    title: "Observation Date",
    key: "observationDate",
    dataIndex: "grenralDetails",
    width: "140px",
    sortable: true,
    sorter: (a, b) =>
      new Date(a?.grenralDetails?.DateOfObservation) -
      new Date(b?.grenralDetails?.DateOfObservation),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {getAllTimes(val?.DateOfObservation)?.formattedDate2 || "—"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record?.grenralDetails?.DateOfObservation).toDateString() ===
          new Date(val).toDateString(),
    },
  },
  {
    title: "Teacher Status",
    key: "isTeacherCompletes",
    dataIndex: "isTeacherCompletes",
    width: "140px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },
  {
    title: "Observer Status",
    key: "isObserverCompleted",
    dataIndex: "isObserverCompleted",
    width: "145px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "190px",
    render: (_, record) => {
      const { isTeacherCompletes, isObserverCompleted } = record;
      const renderAction = () => {
        if (isTeacherCompletes && isObserverCompleted) {
          return (
            <>
              <Link to={`/classroom-walkthrough/report/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                  View Report
                </Button>
              </Link>
              {currentUserRole === UserRole[1] && (
                <Link to={`/classroom-walkthrough/edit/${record._id}`}>
                  <Button size="md" variant="outline" colorScheme="green" fontWeight="medium" flexShrink={0}>
                    Edit
                  </Button>
                </Link>
              )}
            </>
          );
        }
        if (currentUserRole === UserRole[1]) {
          return <Reminder id={record?._id} type="form2" />;
        }
        if (
          currentUserRole === UserRole[2] &&
          (!isTeacherCompletes || !isObserverCompleted)
        ) {
          return (
            <Link to={`/classroom-walkthrough/create/${record._id}`}>
              <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                Continue Form
              </Button>
            </Link>
          );
        }
        return null;
      };

      return (
        <Flex gap={1} align="center">
          {renderAction()}
          {currentUserRole === UserRole[1] && onDelete && (
            <Button
              size="md"
              variant="outline"
              colorScheme="red"
              px={2}
              flexShrink={0}
              onClick={() => onDelete(record._id)}
              title="Delete"
            >
              <DeleteFilled />
            </Button>
          )}
        </Flex>
      );
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. NOTEBOOK CHECKING columns
// ─────────────────────────────────────────────────────────────────────────────
export const getNotebookColumns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: currentUserRole === UserRole[1] ? "Teacher Name" : "Observer Name",
    key: "personName",
    dataIndex: "grenralDetails",
    width: "160px",
    sortable: true,
    sorter: (a, b) => {
      const aName =
        currentUserRole === UserRole[1]
          ? a?.teacherID?.name || a?.createdBy?.name || ""
          : a?.grenralDetails?.NameofObserver?.name || "";
      const bName =
        currentUserRole === UserRole[1]
          ? b?.teacherID?.name || b?.createdBy?.name || ""
          : b?.grenralDetails?.NameofObserver?.name || "";
      return aName.localeCompare(bName);
    },
    render: (val, record) => (
      <Text fontWeight="500" fontSize="sm">
        {currentUserRole === UserRole[1]
          ? record?.teacherID?.name || record?.createdBy?.name || "—"
          : val?.NameofObserver?.name || "—"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(
        data.map((r) =>
          currentUserRole === UserRole[1]
            ? r?.teacherID?.name || r?.createdBy?.name
            : r?.grenralDetails?.NameofObserver?.name,
        ),
      ),
      matchFn: (record, vals) => {
        const name =
          currentUserRole === UserRole[1]
            ? record?.teacherID?.name || record?.createdBy?.name
            : record?.grenralDetails?.NameofObserver?.name;
        return vals.includes(name || "");
      },
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.className || "").localeCompare(
        b?.grenralDetails?.className || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.className || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.className)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.className || ""),
    },
  },
  {
    title: "Section",
    key: "section",
    dataIndex: "grenralDetails",
    width: "90px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.Section || "").localeCompare(
        b?.grenralDetails?.Section || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.Section || "—"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Section)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Section || ""),
    },
  },
  {
    title: "Observation Date",
    key: "observationDate",
    dataIndex: "grenralDetails",
    width: "140px",
    sortable: true,
    sorter: (a, b) =>
      new Date(a?.grenralDetails?.DateOfObservation) -
      new Date(b?.grenralDetails?.DateOfObservation),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {getAllTimes(val?.DateOfObservation)?.formattedDate2 || "—"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record?.grenralDetails?.DateOfObservation).toDateString() ===
          new Date(val).toDateString(),
    },
  },

  {
    title: "Teacher Status",
    key: "isTeacherComplete",
    dataIndex: "isTeacherComplete",
    width: "145px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },
  {
    title: "Observer Status",
    key: "isObserverComplete",
    dataIndex: "isObserverComplete",
    width: "150px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },

  {
    title: "Teacher Score",
    key: "teacherScore",
    width: "140px",
    render: (_, record) => {
      const score = calculateNotebookScore(record?.TeacherForm);
      return score.outOfScore > 0 ? (
        <Text fontSize="sm" fontWeight="600" color="brand.primary">
          {score.totalScore} / {score.outOfScore}
        </Text>
      ) : (
        <Text fontSize="sm" color="gray.400">
          —
        </Text>
      );
    },
  },
  {
    title: "Observer Score",
    key: "observerScore",
    width: "145px",
    render: (_, record) => {
      const score = calculateNotebookScore(record?.ObserverForm);
      return score.outOfScore > 0 ? (
        <Text fontSize="sm" fontWeight="600" color="brand.primary">
          {score.totalScore} / {score.outOfScore}
        </Text>
      ) : (
        <Text fontSize="sm" color="gray.400">
          —
        </Text>
      );
    },
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    width: "180px",
    render: (_, record) => {
      const { isObserverComplete, isTeacherComplete } = record;

      const renderAction = () => {
        if (isObserverComplete) {
          return (
            <Flex gap={1} align="center">
              <Link to={`/notebook-checking-proforma/report/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                  View Report
                </Button>
              </Link>
            </Flex>
          );
        }

        if (isTeacherComplete) {
          if (currentUserRole === UserRole[1]) {
            return (
              <Link to={`/notebook-checking-proforma/create/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                  Continue Form
                </Button>
              </Link>
            );
          } else {
            return <Reminder id={record?._id} type="form3" />;
          }
        } else {
          if (currentUserRole === UserRole[2]) {
            return (
              <Link to={`/notebook-checking-proforma/edit/${record._id}`}>
                <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
                  Continue Form
                </Button>
              </Link>
            );
          } else {
            return <Reminder id={record?._id} type="form3" />;
          }
        }
      };

      return (
        <Flex gap={1} align="center">
          {renderAction()}
          {currentUserRole === UserRole[1] && onDelete && (
            <Button
              size="md"
              variant="outline"
              colorScheme="red"
              px={2}
              flexShrink={0}
              onClick={() => onDelete(record._id)}
              title="Delete"
            >
              <DeleteFilled />
            </Button>
          )}
        </Flex>
      );
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. WEEKLY 4 FORM columns
// ─────────────────────────────────────────────────────────────────────────────
export const getWeeklyColumns = ({ data = [], currentUserRole }) => [
  {
    title: "Teacher Name",
    key: "teacherName",
    dataIndex: "teacherId",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherId?.name || "").localeCompare(b?.teacherId?.name || ""),
    render: (val) => (
      <Text fontWeight="500" fontSize="sm">
        {val?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherId?.name)),
      matchFn: (record, vals) => vals.includes(record?.teacherId?.name || ""),
    },
  },
  {
    title: "Observer",
    key: "observerName",
    dataIndex: "isInitiated",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.isInitiated?.Observer?.name || "").localeCompare(
        b?.isInitiated?.Observer?.name || "",
      ),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val?.Observer?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.isInitiated?.Observer?.name)),
      matchFn: (record, vals) =>
        vals.includes(record?.isInitiated?.Observer?.name || ""),
    },
  },
  {
    title: "Submission Date",
    key: "dateOfSubmission",
    dataIndex: "dateOfSubmission",
    width: "140px",
    sortable: true,
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val ? getAllTimes(val)?.formattedDate2 : "—"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record.dateOfSubmission).toDateString() ===
          new Date(val).toDateString(),
    },
  },
  {
    title: "Status",
    key: "isCompleted",
    dataIndex: "isCompleted",
    width: "130px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "190px",
    render: (_, record) => (
      <Stack direction="row" spacing={2}>
        {record?.isCompleted ? (
          <Link to={`/weekly4form/report/${record._id}`}>
            <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
              View Report
            </Button>
          </Link>
        ) : currentUserRole === UserRole[2] ? (
          <Link to={`/weekly4form/create/${record?._id}`}>
            <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
              Continue Form
            </Button>
          </Link>
        ) : null}
        {currentUserRole === UserRole[1] && !record?.isCompleted && (
          <Reminder id={record?._id} type="form4" />
        )}
      </Stack>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. USERS TABLE (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getUserColumns = ({ onDelete }) => [
  {
    title: "Employee ID",
    key: "employeeId",
    dataIndex: "employeeId",
    width: "130px",
    sortable: true,
    filterConfig: { type: "text" },
  },
  {
    title: "Name",
    key: "name",
    dataIndex: "name",
    width: "180px",
    sortable: true,
    filterConfig: { type: "text" },
  },
  {
    title: "Access",
    key: "access",
    dataIndex: "access",
    width: "130px",
    render: (val) => (
      <Tag
        colorScheme={
          val === "Superadmin"
            ? "purple"
            : val === "Observer"
              ? "blue"
              : "green"
        }
        variant="subtle"
      >
        {val}
      </Tag>
    ),
    filterConfig: {
      type: "select",
      options: ["Superadmin", "Observer", "Teacher"],
    },
  },
  {
    title: "Custom ID",
    key: "customId",
    dataIndex: "customId",
    width: "130px",
    filterConfig: { type: "text" },
  },
  {
    title: "Created At",
    key: "createdAt",
    dataIndex: "createdAt",
    width: "130px",
    sortable: true,
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {getAllTimes(val)?.formattedDate2 || "—"}
      </Text>
    ),
    filterConfig: { type: "date" },
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    width: "180px",
    render: (_, record) => (
      <Stack direction="row" spacing={2}>
        <Link to={`${record?._id}`}>
          <Button
            size="sm"
            variant="ghost"
            color="brand.primary"
            _hover={{ bg: "brand.background" }}
          >
            View
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          color="red.600"
          _hover={{ bg: "red.50" }}
          leftIcon={<DeleteFilled />}
          onClick={() => onDelete(record?._id)}
        >
          Delete
        </Button>
      </Stack>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLASS & SECTION TABLE (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getClassSectionColumns = ({ onDelete }) => [
  {
    title: "Class Name",
    key: "className",
    dataIndex: "className",
    width: "150px",
    sortable: true,
    render: (val) => (
      <Text fontWeight="600" fontSize="sm">
        {val || "—"}
      </Text>
    ),
    filterConfig: { type: "text" },
  },
  {
    title: "Sections",
    key: "sections",
    dataIndex: "sections",
    render: (sections) => (
      <Flex wrap="wrap" gap={1}>
        {(sections || []).map((s, i) => (
          <Tag key={i} variant="subtle" colorScheme="blue" fontSize="xs">
            {s.name}
          </Tag>
        ))}
      </Flex>
    ),
  },
  {
    title: "Subjects",
    key: "subjects",
    dataIndex: "subjects",
    render: (subjects) => (
      <Flex wrap="wrap" gap={1}>
        {(subjects || []).map((s, i) => (
          <Tag key={i} variant="subtle" colorScheme="green" fontSize="xs">
            {s.name}
          </Tag>
        ))}
      </Flex>
    ),
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    width: "120px",
    render: (_, record) => (
      <Button
        size="sm"
        variant="ghost"
        colorScheme="red"
        color="red.600"
        _hover={{ bg: "red.50" }}
        leftIcon={<DeleteFilled />}
        onClick={() => onDelete(record)}
      >
        Delete
      </Button>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. WING COORDINATOR TABLE
// ─────────────────────────────────────────────────────────────────────────────
export const getWingCoordinatorColumns = ({ data = [] }) => [
  {
    title: "Teacher",
    key: "teacherName",
    dataIndex: "teacherID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherID?.name || "").localeCompare(b?.teacherID?.name || ""),
    render: (val) => (
      <Text fontWeight="500" fontSize="sm">
        {val?.name || "—"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherID?.name)),
      matchFn: (record, vals) => vals.includes(record?.teacherID?.name || ""),
    },
  },
  {
    title: "Date",
    key: "date",
    dataIndex: "date",
    width: "130px",
    sortable: true,
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val ? getAllTimes(val)?.formattedDate2 : "—"}
      </Text>
    ),
    filterConfig: { type: "date" },
  },
  {
    title: "Status",
    key: "isCompleted",
    dataIndex: "isCompleted",
    width: "130px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "160px",
    render: (_, record) =>
      record?.isCompleted ? (
        <Link to={`/wing-coordinator/report/${record._id}`}>
          <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
            View Report
          </Button>
        </Link>
      ) : (
        <Link to={`/wing-coordinator/create/${record._id}`}>
          <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
            Continue
          </Button>
        </Link>
      ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. REPORTS — Form 1 (Fortnightly Monitor Report)
// ─────────────────────────────────────────────────────────────────────────────
export const getReportForm1Columns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: "Observer Name",
    key: "observerName",
    dataIndex: "coordinatorID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.coordinatorID?.name || a?.userId?.name || "").localeCompare(
        b?.coordinatorID?.name || b?.userId?.name || "",
      ),
    render: (val, record) => (
      <Text fontSize="sm" fontWeight="500">
        {val?.name || record?.userId?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.coordinatorID?.name || r?.userId?.name)),
      matchFn: (record, vals) =>
        vals.includes(
          record?.coordinatorID?.name || record?.userId?.name || "",
        ),
    },
  },
  {
    title: "Teacher Name",
    key: "teacherName",
    dataIndex: "teacherID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherID?.name || a?.userId?.name || "").localeCompare(
        b?.teacherID?.name || b?.userId?.name || "",
      ),
    render: (val, record) => (
      <Text fontSize="sm">{val?.name || record?.userId?.name || "N/A"}</Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherID?.name || r?.userId?.name)),
      matchFn: (record, vals) =>
        vals.includes(record?.teacherID?.name || record?.userId?.name || ""),
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "className",
    width: "120px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r.className)),
    },
  },
  {
    title: "Section",
    key: "section",
    dataIndex: "section",
    width: "90px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r.section)),
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
        {val ? new Date(val).toLocaleDateString() : "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record.date).toDateString() === new Date(val).toDateString(),
    },
  },
  {
    title: "Teacher Status",
    key: "isTeacherComplete",
    dataIndex: "isTeacherComplete",
    width: "145px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "150px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },
  {
    title: "Teacher Score",
    key: "teacherScore",
    dataIndex: "teacherScore",
    width: "140px",
    sortable: true,
    sorter: (a, b) => (a.teacherScore || 0) - (b.teacherScore || 0),
    render: (val, record) => (
      <Text
        fontSize="sm"
        fontWeight="600"
        color={val ? "brand.primary" : "gray.400"}
      >
        {val ? `${val} / ${record.teacherTotal}` : "N/A"}
      </Text>
    ),
  },
  {
    title: "Observer Score",
    key: "observerScore",
    dataIndex: "observerScore",
    width: "145px",
    sortable: true,
    sorter: (a, b) => (a.observerScore || 0) - (b.observerScore || 0),
    render: (val, record) => (
      <Text
        fontSize="sm"
        fontWeight="600"
        color={val ? "brand.primary" : "gray.400"}
      >
        {val ? `${val} / ${record.observerTotal}` : "N/A"}
      </Text>
    ),
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    width: "150px",
    render: (_, record) => (
      <Flex gap={1} align="center">
        <Link to={`/fortnightly-monitor/report/${record._id}`}>
          <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
            View Report
          </Button>
        </Link>
        {currentUserRole === UserRole[1] && onDelete && (
          <Button
            size="md"
            variant="outline"
            colorScheme="red"
            px={2}
            flexShrink={0}
            onClick={() => onDelete(record._id)}
            title="Delete"
          >
            <DeleteFilled />
          </Button>
        )}
      </Flex>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. REPORTS — Form 2 (Classroom Walkthrough Report)
// ─────────────────────────────────────────────────────────────────────────────
export const getReportForm2Columns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: "Observer Name",
    key: "observerName",
    dataIndex: "createdBy",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.createdBy?.name || "").localeCompare(b?.createdBy?.name || ""),
    render: (val) => (
      <Text fontSize="sm" fontWeight="500">
        {val?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.createdBy?.name)),
      matchFn: (record, vals) => vals.includes(record?.createdBy?.name || ""),
    },
  },
  {
    title: "Teacher Name",
    key: "teacherName",
    dataIndex: "grenralDetails",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.NameoftheVisitingTeacher?.name || "").localeCompare(
        b?.grenralDetails?.NameoftheVisitingTeacher?.name || "",
      ),
    render: (val) => (
      <Text fontSize="sm">{val?.NameoftheVisitingTeacher?.name || "N/A"}</Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(
        data.map((r) => r?.grenralDetails?.NameoftheVisitingTeacher?.name),
      ),
      matchFn: (record, vals) =>
        vals.includes(
          record?.grenralDetails?.NameoftheVisitingTeacher?.name || "",
        ),
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.className || "").localeCompare(
        b?.grenralDetails?.className || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.className || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.className)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.className || ""),
    },
  },
  {
    title: "Section",
    key: "section",
    dataIndex: "grenralDetails",
    width: "90px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val?.Section || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Section)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Section || ""),
    },
  },
  {
    title: "Subject",
    key: "subject",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val?.Subject || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Subject)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Subject || ""),
    },
  },
  {
    title: "Date",
    key: "observationDate",
    dataIndex: "grenralDetails",
    width: "130px",
    sortable: true,
    sorter: (a, b) =>
      new Date(a?.grenralDetails?.DateOfObservation) -
      new Date(b?.grenralDetails?.DateOfObservation),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val?.DateOfObservation
          ? new Date(val.DateOfObservation).toLocaleDateString()
          : "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record?.grenralDetails?.DateOfObservation).toDateString() ===
          new Date(val).toDateString(),
    },
  },
  {
    title: "Total Score",
    key: "totalScores",
    dataIndex: "totalScores",
    width: "120px",
    sortable: true,
    sorter: (a, b) => (a.totalScores || 0) - (b.totalScores || 0),
    render: (val, record) => (
      <Text
        fontSize="sm"
        fontWeight="600"
        color={val ? "brand.primary" : "gray.400"}
      >
        {val
          ? record?.scoreOutof > 0
            ? `${val} / ${record.scoreOutof}`
            : val
          : "N/A"}
      </Text>
    ),
  },
  {
    title: "Teacher Status",
    key: "isTeacherCompletes",
    dataIndex: "isTeacherCompletes",
    width: "145px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },
  {
    title: "Observer Status",
    key: "isObserverCompleted",
    dataIndex: "isObserverCompleted",
    width: "150px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "150px",
    render: (_, record) => (
      <Flex gap={1} align="center">
        <Link to={`/classroom-walkthrough/report/${record._id}`}>
          <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
            View Report
          </Button>
        </Link>
        {currentUserRole === UserRole[1] && onDelete && (
          <Button
            size="md"
            variant="outline"
            colorScheme="red"
            px={2}
            flexShrink={0}
            onClick={() => onDelete(record._id)}
            title="Delete"
          >
            <DeleteFilled />
          </Button>
        )}
      </Flex>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. REPORTS — Form 3 (Notebook Checking Report)
// ─────────────────────────────────────────────────────────────────────────────
const calculateNotebookScore = (formName) => {
  let totalScore = 0,
    outOfScore = 0;
  const keys = [
    "maintenanceOfNotebooks",
    "qualityOfOppurtunities",
    "qualityOfTeacherFeedback",
    "qualityOfLearner",
  ];
  keys.forEach((section) => {
    if (formName?.[section]) {
      formName[section].forEach((item) => {
        const ans = item?.answer;
        if (["1", "2", "3"].includes(ans)) {
          totalScore += parseInt(ans, 10);
          outOfScore += 3;
        }
      });
    }
  });
  return { totalScore, outOfScore };
};

export const getReportForm3Columns = ({
  data = [],
  currentUserRole,
  onDelete,
}) => [
  {
    title: "Observer Name",
    key: "observerName",
    dataIndex: "grenralDetails",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (
        a?.grenralDetails?.NameofObserver?.name ||
        a?.createdBy?.name ||
        ""
      ).localeCompare(
        b?.grenralDetails?.NameofObserver?.name || b?.createdBy?.name || "",
      ),
    render: (val, record) => (
      <Text fontSize="sm" fontWeight="500">
        {val?.NameofObserver?.name || record?.createdBy?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(
        data.map(
          (r) => r?.grenralDetails?.NameofObserver?.name || r?.createdBy?.name,
        ),
      ),
      matchFn: (record, vals) =>
        vals.includes(
          record?.grenralDetails?.NameofObserver?.name ||
            record?.createdBy?.name ||
            "",
        ),
    },
  },
  {
    title: "Teacher Name",
    key: "teacherName",
    dataIndex: "teacherID",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherID?.name || a?.createdBy?.name || "").localeCompare(
        b?.teacherID?.name || b?.createdBy?.name || "",
      ),
    render: (val, record) => (
      <Text fontSize="sm">{val?.name || record?.createdBy?.name || "N/A"}</Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherID?.name || r?.createdBy?.name)),
      matchFn: (record, vals) =>
        vals.includes(record?.teacherID?.name || record?.createdBy?.name || ""),
    },
  },
  {
    title: "Class",
    key: "className",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    sorter: (a, b) =>
      (a?.grenralDetails?.className || "").localeCompare(
        b?.grenralDetails?.className || "",
      ),
    render: (val) => <Text fontSize="sm">{val?.className || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.className)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.className || ""),
    },
  },
  {
    title: "Section",
    key: "section",
    dataIndex: "grenralDetails",
    width: "90px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val?.Section || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Section)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Section || ""),
    },
  },
  {
    title: "Subject",
    key: "subject",
    dataIndex: "grenralDetails",
    width: "110px",
    sortable: true,
    render: (val) => <Text fontSize="sm">{val?.Subject || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.grenralDetails?.Subject)),
      matchFn: (record, vals) =>
        vals.includes(record?.grenralDetails?.Subject || ""),
    },
  },
  {
    title: "Observation Date",
    key: "observationDate",
    dataIndex: "grenralDetails",
    width: "140px",
    sortable: true,
    sorter: (a, b) =>
      new Date(a?.grenralDetails?.DateOfObservation) -
      new Date(b?.grenralDetails?.DateOfObservation),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val?.DateOfObservation
          ? new Date(val.DateOfObservation).toLocaleDateString()
          : "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record?.grenralDetails?.DateOfObservation).toDateString() ===
          new Date(val).toDateString(),
    },
  },

  {
    title: "Teacher Status",
    key: "isTeacherComplete",
    dataIndex: "isTeacherComplete",
    width: "145px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },
  {
    title: "Observer Status",
    key: "isObserverComplete",
    dataIndex: "isObserverComplete",
    width: "150px",
    render: (val) => <StatusBadge value={val} />,
    filterConfig: {
      type: "boolean",
      trueLabel: "Completed",
      falseLabel: "Pending",
    },
  },

  {
    title: "Teacher Score",
    key: "teacherScore",
    width: "140px",
    render: (_, record) => {
      const score = calculateNotebookScore(record?.TeacherForm);
      return score.outOfScore > 0 ? (
        <Text fontSize="sm" fontWeight="600" color="brand.primary">
          {score.totalScore} / {score.outOfScore}
        </Text>
      ) : (
        <Text fontSize="sm" color="gray.400">
          N/A
        </Text>
      );
    },
  },
  {
    title: "Observer Score",
    key: "observerScore",
    width: "145px",
    render: (_, record) => {
      const score = calculateNotebookScore(record?.ObserverForm);
      return score.outOfScore > 0 ? (
        <Text fontSize="sm" fontWeight="600" color="brand.primary">
          {score.totalScore} / {score.outOfScore}
        </Text>
      ) : (
        <Text fontSize="sm" color="gray.400">
          N/A
        </Text>
      );
    },
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    width: "150px",
    render: (_, record) => (
      <Flex gap={1} align="center">
        <Link to={`/notebook-checking-proforma/report/${record._id}`}>
          <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
            View Report
          </Button>
        </Link>
        {currentUserRole === UserRole[1] && onDelete && (
          <Button
            size="md"
            variant="outline"
            colorScheme="red"
            px={2}
            flexShrink={0}
            onClick={() => onDelete(record._id)}
            title="Delete"
          >
            <DeleteFilled />
          </Button>
        )}
      </Flex>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. REPORTS — Form 4 (Weekly 4 Form Report)
// ─────────────────────────────────────────────────────────────────────────────
export const getReportForm4Columns = ({ data = [] }) => [
  {
    title: "Observer Name",
    key: "observerName",
    dataIndex: "isInitiated",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.isInitiated?.Observer?.name || "").localeCompare(
        b?.isInitiated?.Observer?.name || "",
      ),
    render: (val) => (
      <Text fontSize="sm" fontWeight="500">
        {val?.Observer?.name || "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.isInitiated?.Observer?.name)),
      matchFn: (record, vals) =>
        vals.includes(record?.isInitiated?.Observer?.name || ""),
    },
  },
  {
    title: "Teacher Name",
    key: "teacherName",
    dataIndex: "teacherId",
    width: "160px",
    sortable: true,
    sorter: (a, b) =>
      (a?.teacherId?.name || "").localeCompare(b?.teacherId?.name || ""),
    render: (val) => <Text fontSize="sm">{val?.name || "N/A"}</Text>,
    filterConfig: {
      type: "select",
      options: uniq(data.map((r) => r?.teacherId?.name)),
      matchFn: (record, vals) => vals.includes(record?.teacherId?.name || ""),
    },
  },
  {
    title: "Date of Submission",
    key: "dateOfSubmission",
    dataIndex: "dateOfSubmission",
    width: "155px",
    sortable: true,
    sorter: (a, b) =>
      new Date(a.dateOfSubmission) - new Date(b.dateOfSubmission),
    render: (val) => (
      <Text fontSize="sm" color="gray.600">
        {val ? new Date(val).toLocaleDateString() : "N/A"}
      </Text>
    ),
    filterConfig: {
      type: "date",
      matchFn: (record, val) =>
        !val ||
        new Date(record.dateOfSubmission).toDateString() ===
          new Date(val).toDateString(),
    },
  },
  {
    title: "Status",
    key: "isCompleted",
    dataIndex: "isCompleted",
    width: "130px",
    render: (val) => <StatusBadge value={val} />,
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
    width: "150px",
    render: (_, record) => (
      <Link to={`/weekly4form/report/${record._id}`}>
        <Button size="md" variant="outline" colorScheme="blue" fontWeight="medium" flexShrink={0}>
          View Report
        </Button>
      </Link>
    ),
  },
];
