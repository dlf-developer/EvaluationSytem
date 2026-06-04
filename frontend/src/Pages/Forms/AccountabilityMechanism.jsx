import React, { useEffect, useMemo } from "react";
import { getUserId, getAllTimes } from "../../Utils/auth";
import { Table } from "antd";
import { UserRole } from "../../config/config";
import { PlusOutlined, DeleteFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccountability,
  getAccountabilities,
  deleteAccountabilityForm,
} from "../../redux/userSlice";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Tag,
  Text,
} from "@chakra-ui/react";
import { message, Modal } from "antd";

import SmartTable from "../../Components/SmartTable";

function AccountabilityMechanism() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const id = getUserId()?.id;
  const { accountabilityList, loading } = useSelector((s) => s?.user);

  useEffect(() => {
    dispatch(getAccountabilities(id));
  }, [dispatch, id]);

  const createForm = async () => {
    const res = await dispatch(createAccountability()).unwrap();
    if (res?.success) navigate(`/accountability/${res?.data?._id}`);
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
          const res = await dispatch(deleteAccountabilityForm(formId)).unwrap();
          if (res?.success) {
            message.success("Form deleted successfully");
            dispatch(getAccountabilities(id));
          } else {
            message.error("Failed to delete form");
          }
        } catch (error) {
          message.error("An error occurred while deleting");
        }
      },
    });
  };

  const observerFilters = useMemo(() => {
    if (!accountabilityList?.data) return [];
    const observers = new Map();
    accountabilityList.data.forEach((item) => {
      if (item?.userId?._id && item?.userId?.name) {
        observers.set(item.userId._id, item.userId.name);
      }
    });
    return Array.from(observers.values());
  }, [accountabilityList?.data]);

  const columns = [
    {
      title: "REPORT NAME",
      dataIndex: "formName",
      key: "formName",
      width: 180,
      render: (val) => (
        <Text fontSize="sm" fontWeight="600" color="brand.text">
          {val || "—"}
        </Text>
      ),
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
      render: (user) => (
        <Text fontSize="sm" fontWeight="500" color="gray.600">
          {user?.name || "—"}
        </Text>
      ),
    },
    {
      title: "DATE RANGE",
      key: "dateRange",
      width: 200,
      render: (_, record) => (
        <Text fontSize="sm" color="gray.600">
          {record.fromDate ? getAllTimes(record.fromDate).formattedDate2 : "N/A"}{" "}
          -{" "}
          {record.toDate ? getAllTimes(record.toDate).formattedDate2 : "N/A"}
        </Text>
      ),
    },
    {
      title: "TEACHERS",
      key: "teachersCount",
      width: 160,
      render: (_, record) => (
        <Box
          as="span"
          display="inline-flex"
          alignItems="center"
          px="8px"
          py="3px"
          borderRadius="full"
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
        >
          <Text
            as="span"
            fontSize="11px"
            fontWeight="600"
            color="blue.700"
          >
            {record.teachers?.length || 0} Teachers
          </Text>
        </Box>
      ),
    },
    {
      title: "CREATED",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
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
      width: 140,
      filterConfig: {
        type: "boolean",
        trueLabel: "Completed",
        falseLabel: "Pending"
      },
      render: (isComplete) => (
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
      ),
    },
    {
      title: "ACTION",
      key: "action",
      width: 280,
      render: (_, record) => {
        const { isDraft, isComplete } = record;
        return (
          <Flex gap={1} align="center">
            {isDraft && !isComplete && (
              <Link to={`/accountability/${record._id}`}>
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
            {!isDraft && isComplete && (
              <Link to={`/accountability/report/${record._id}`}>
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
            )}
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
            Accountability Mechanism
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and aggregate teacher evaluation scores across multiple forms.
          </Text>
        </Box>

        {(getUserId()?.access === UserRole[0] || getUserId()?.access === UserRole[1]) && (
          <Button
            leftIcon={<PlusOutlined />}
            bg="#4a6741"
            color="white"
            _hover={{ bg: "#3f5937", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            onClick={createForm}
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
        data={accountabilityList?.data || []}
        loading={loading}
        rowKey="_id"
        pageSize={10}
      />
    </Box>
  );
}

export default AccountabilityMechanism;
