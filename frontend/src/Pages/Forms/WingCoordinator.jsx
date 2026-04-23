import React, { useEffect } from "react";
import { getUserId, getAllTimes } from "../../Utils/auth";
import { Table } from "antd";
import { UserRole } from "../../config/config";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createWingForm, GetWingFrom } from "../../redux/userSlice";
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
} from "@chakra-ui/react";

function WingCoordinator() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const id         = getUserId()?.id;
  const { getWingFormlist, loading } = useSelector((s) => s?.user);

  useEffect(() => { dispatch(GetWingFrom(id)); }, [dispatch]);

  const createFrom = async () => {
    const res = await dispatch(createWingForm()).unwrap();
    if (res?.success) navigate(`/wing-coordinator/${res?.data?._id}`);
  };

  const columns = [
    {
      title: "Observer",
      dataIndex: "userId",
      key: "userId",
      width: 180,
      sorter: (a, b) => (a?.userId?.name || "").localeCompare(b?.userId?.name || ""),
      render: (user) => (
        <Text fontSize="sm" fontWeight="500" color="brand.text">
          {user?.name || "—"}
        </Text>
      ),
    },
    {
      title: "Classes",
      dataIndex: "className",
      key: "className",
      width: 200,
      render: (classes) =>
        Array.isArray(classes) && classes.length > 0 ? (
          <Flex flexWrap="wrap" gap={1}>
            {classes.map((c, i) => (
              <Tag key={i} size="sm" colorScheme="green" variant="subtle" borderRadius="full">
                {c}
              </Tag>
            ))}
          </Flex>
        ) : (
          <Text fontSize="sm" color="gray.400">—</Text>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <Text fontSize="sm" color="gray.500">
          {getAllTimes(date)?.formattedDate2 || "—"}
        </Text>
      ),
    },
    {
      title: "Completion",
      dataIndex: "isComplete",
      key: "isComplete",
      width: 140,
      filters: [
        { text: "Completed", value: true },
        { text: "In Progress", value: false },
      ],
      onFilter: (value, record) => record.isComplete === value,
      render: (isComplete) => (
        <Box
          as="span"
          display="inline-flex"
          alignItems="center"
          px="8px"
          py="3px"
          borderRadius="full"
          bg={isComplete ? "green.50" : "orange.50"}
          border="1px solid"
          borderColor={isComplete ? "green.200" : "orange.200"}
        >
          <Text
            as="span"
            fontSize="11px"
            fontWeight="600"
            color={isComplete ? "green.700" : "orange.600"}
          >
            {isComplete ? "Completed" : "In Progress"}
          </Text>
        </Box>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "isDraft",
      key: "isDraft",
      width: 120,
      filters: [
        { text: "Draft", value: true },
        { text: "Published", value: false },
      ],
      onFilter: (value, record) => record.isDraft === value,
      render: (isDraft, record) => {
        const isPublished = !isDraft && record?.isComplete;
        return (
          <Box
            as="span"
            display="inline-flex"
            alignItems="center"
            px="8px"
            py="3px"
            borderRadius="full"
            bg={isPublished ? "green.50" : "gray.50"}
            border="1px solid"
            borderColor={isPublished ? "green.200" : "gray.200"}
          >
            <Text
              as="span"
              fontSize="11px"
              fontWeight="600"
              color={isPublished ? "green.700" : "gray.500"}
            >
              {isPublished ? "Published" : "Draft"}
            </Text>
          </Box>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record) => {
        const { isDraft, isComplete } = record;
        return (
          <HStack spacing={2}>
            {isDraft && !isComplete && (
              <Link to={`/wing-coordinator/${record._id}`}>
                <button className="text-nowrap px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors">
                  Continue Form
                </button>
              </Link>
            )}
            {!isDraft && isComplete && (
              <Link to={`/wing-coordinator/report/${record._id}`}>
                <button className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors">
                  View Report
                </button>
              </Link>
            )}
          </HStack>
        );
      },
    },
  ];

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="brand.text" mb={1}>
            Wing Coordinator Analysis
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and review all wing coordinator analysis forms.
          </Text>
        </Box>

        {getUserId()?.access === UserRole[1] && (
          <Button
            leftIcon={<PlusOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.secondary", transform: "translateY(-2px)" }}
            transition="all 0.15s"
            onClick={createFrom}
            px={6}
            isLoading={loading}
          >
            New Analysis
          </Button>
        )}
      </Flex>

      {/* Table card */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        p={6}
        w="100%"
        overflowX="auto"
      >
        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner size="lg" color="brand.primary" thickness="3px" />
          </Flex>
        ) : (
          <Table
            columns={columns}
            dataSource={getWingFormlist?.data || []}
            rowKey="_id"
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} records` }}
            locale={{ emptyText: (
              <Box py={10} textAlign="center">
                <Text color="gray.400" fontSize="sm">No wing coordinator forms yet.</Text>
                {getUserId()?.access === UserRole[1] && (
                  <Text fontSize="sm" color="brand.primary" mt={1} cursor="pointer" onClick={createFrom}>
                    Create your first form →
                  </Text>
                )}
              </Box>
            )}}
          />
        )}
      </Box>
    </Box>
  );
}

export default WingCoordinator;
