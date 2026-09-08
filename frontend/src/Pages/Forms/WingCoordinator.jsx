import React, { useEffect, useMemo, useState } from "react";
import { getUserId, getAllTimes } from "../../Utils/auth";
import { Table } from "antd";
import { UserRole } from "../../config/config";
import { PlusOutlined, DeleteFilled, CopyOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createWingForm, GetWingFrom, deleteWingForm, duplicateWingForm } from "../../redux/userSlice";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { message, Modal } from "antd";

import SmartTable from "../../Components/SmartTable";

function WingCoordinator() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const id = getUserId()?.id;
  const { getWingFormlist, loading } = useSelector((s) => s?.user);
  const [duplicatingId, setDuplicatingId] = useState(null);

  useEffect(() => {
    dispatch(GetWingFrom(id));
  }, [dispatch, id]);

  const createFrom = async () => {
    const res = await dispatch(createWingForm()).unwrap();
    if (res?.success) navigate(`/wing-coordinator/${res?.data?._id}`);
  };

  const handleDuplicate = async (recordId) => {
    try {
      setDuplicatingId(recordId);
      const res = await dispatch(duplicateWingForm(recordId)).unwrap();
      if (res?.success && res?.data?._id) {
        message.success("Report duplicated successfully");
        navigate(`/wing-coordinator/${res.data._id}`);
      } else {
        message.error(res?.message || "Failed to duplicate report");
      }
    } catch (error) {
      message.error(error?.message || "An error occurred while duplicating");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = (formId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this form?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await dispatch(deleteWingForm(formId)).unwrap();
          if (res?.message === "Wing Coordinator deleted successfully" || res?.success) {
            message.success("Form deleted successfully");
            dispatch(GetWingFrom(id));
          } else {
            message.success("Form deleted successfully");
            dispatch(GetWingFrom(id));
          }
        } catch (error) {
          message.error("An error occurred while deleting");
        }
      },
    });
  };

  const observerFilters = useMemo(() => {
    if (!getWingFormlist?.data) return [];
    const observers = new Map();
    getWingFormlist.data.forEach((item) => {
      if (item?.userId?._id && item?.userId?.name) {
        observers.set(item.userId._id, item.userId.name);
      }
    });
    return Array.from(observers.values());
  }, [getWingFormlist?.data]);

  const classFilters = useMemo(() => {
    if (!getWingFormlist?.data) return [];
    const classes = new Set();
    getWingFormlist.data.forEach((item) => {
      if (Array.isArray(item?.className)) {
        item.className.forEach((c) => classes.add(c));
      } else if (item?.className) {
        classes.add(item.className);
      }
    });
    return Array.from(classes).sort();
  }, [getWingFormlist?.data]);

  const columns = [
    {
      title: "REPORT NAME",
      dataIndex: "formName",
      key: "formName",
      width: 200,
      filterConfig: {
        type: "text"
      },
      render: (val) => {
        if (!val) return <Text fontSize="sm" color="gray.400">—</Text>;
        const isLong = val.length > 24;
        const displayVal = isLong ? `${val.slice(0, 24)}...` : val;
        return (
          <Tooltip label={val} placement="topLeft" hasArrow isDisabled={!isLong}>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="brand.text"
              isTruncated
              maxW="200px"
              title={val}
            >
              {displayVal}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "OBSERVER",
      dataIndex: "userId",
      key: "userId",
      width: 180,
      filterConfig: {
        type: "select",
        options: observerFilters,
        matchFn: (record, vals) => vals.includes(record?.userId?.name || "")
      },
      render: (user) => {
        const name = user?.name || "—";
        const isLong = name.length > 20;
        const displayVal = isLong ? `${name.slice(0, 20)}...` : name;
        return (
          <Tooltip label={name} placement="topLeft" hasArrow isDisabled={!isLong}>
            <Text
              fontSize="sm"
              fontWeight="500"
              color="gray.600"
              isTruncated
              maxW="180px"
              title={name}
            >
              {displayVal}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "CLASSES",
      dataIndex: "className",
      key: "className",
      width: 200,
      filterConfig: {
        type: "select",
        options: classFilters,
        matchFn: (record, vals) => {
          if (!record?.className) return false;
          if (Array.isArray(record.className)) {
            return record.className.some(c => vals.includes(c));
          }
          return vals.includes(record.className);
        }
      },
      render: (classes) => {
        if (!Array.isArray(classes) || classes.length === 0) {
          return (
            <Text fontSize="sm" color="gray.400">
              —
            </Text>
          );
        }
        const maxDisplay = 2;
        const displayed = classes.slice(0, maxDisplay);
        const remaining = classes.length - maxDisplay;

        return (
          <Flex flexWrap="wrap" gap={1} align="center">
            {displayed.map((c, i) => (
              <Tag
                key={i}
                size="sm"
                colorScheme="green"
                variant="subtle"
                borderRadius="full"
              >
                {c}
              </Tag>
            ))}
            {remaining > 0 && (
              <Tooltip label={classes.join(", ")} placement="top" hasArrow>
                <Tag
                  size="sm"
                  colorScheme="gray"
                  variant="solid"
                  borderRadius="full"
                  cursor="pointer"
                >
                  +{remaining} more
                </Tag>
              </Tooltip>
            )}
          </Flex>
        );
      },
    },
    {
      title: "CREATED",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      filterConfig: {
        type: "date"
      },
      render: (date) => (
        <Text fontSize="sm" color="gray.500">
          {getAllTimes(date)?.formattedDate2 || "—"}
        </Text>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "isComplete",
      key: "isComplete",
      width: 190,
      filterConfig: {
        type: "boolean",
        trueLabel: "Completed",
        falseLabel: "Pending"
      },
      render: (isComplete, record) => {
        const isDuplicate = record?.isDuplicate || record?.formName?.includes("(Copy)");
        return (
          <Flex gap={2} align="center" flexWrap="wrap">
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              px="10px"
              py="4px"
              borderRadius="full"
              bg="white"
              border="1px solid"
              borderColor={isComplete ? "green.400" : "orange.400"}
            >
              <Text
                as="span"
                fontSize="11px"
                fontWeight="600"
                color={isComplete ? "green.500" : "orange.500"}
              >
                {isComplete ? "Completed" : "Pending"}
              </Text>
            </Box>
            {isDuplicate && (
              <Tag
                size="sm"
                colorScheme="purple"
                variant="subtle"
                borderRadius="full"
                fontWeight="600"
                px="8px"
                py="2px"
                fontSize="11px"
              >
                Duplicate
              </Tag>
            )}
          </Flex>
        );
      },
    },
    {
      title: "ACTION",
      key: "action",
      width: 360,
      render: (_, record) => {
        const { isDraft, isComplete } = record;
        return (
          <Flex gap={1} align="center">
            {isComplete ? (
              <Link to={`/wing-coordinator/report/${record._id}`}>
                <Button
                  size="md"
                  variant="outline"
                  colorScheme="blue"
                  fontWeight="medium"
                  flexShrink={0}
                >
                  View Report
                </Button>
              </Link>
            ) : (
              <Link to={`/wing-coordinator/${record._id}`}>
                <Button
                  size="md"
                  variant="outline"
                  colorScheme="blue"
                  fontWeight="medium"
                  flexShrink={0}
                >
                  Continue Form
                </Button>
              </Link>
            )}
            <Button
              size="md"
              variant="outline"
              colorScheme="purple"
              fontWeight="medium"
              flexShrink={0}
              leftIcon={<CopyOutlined />}
              isLoading={duplicatingId === record._id}
              onClick={() => handleDuplicate(record._id)}
              title="Duplicate Report"
            >
              Duplicate
            </Button>
            {(getUserId()?.access === UserRole[0] || getUserId()?.access === UserRole[1]) && (
              <Button
                size="md"
                variant="outline"
                colorScheme="red"
                px={2}
                flexShrink={0}
                onClick={() => handleDelete(record._id)}
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

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Monthly Report - Wing Coordinator
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and review all Monthly Report - Wing Coordinator forms.
          </Text>
        </Box>

        {getUserId()?.access === UserRole[1] && (
          <Button
            leftIcon={<PlusOutlined />}
            bg="#4a6741"
            color="white"
            _hover={{ bg: "#3f5937", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={createFrom}
            px={6}
            isLoading={loading}
          >
            Create New Report
          </Button>
        )}
      </Flex>

      <SmartTable
        title="All Forms"
        columns={columns}
        data={getWingFormlist?.data || []}
        loading={loading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default WingCoordinator;
