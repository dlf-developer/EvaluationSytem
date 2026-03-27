import {
  DeleteFilled,
  UserOutlined,
  FileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Space, Spin, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllTimes } from "../../Utils/auth";
import { GetUserList } from "../../redux/userSlice";
import { Box, SimpleGrid, Flex, Heading, Text } from "@chakra-ui/react";

function AdminDashboard() {
  const [loading, setLoading] = useState(false); // Loader state
  const UserLists = useSelector(
    (state) => state?.user?.data?.data || state?.user?.data || [],
  );
  const totalUsers = useSelector(
    (state) => state?.user?.data?.total || UserLists?.length || 0,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    setLoading(true); // Show loader
    dispatch(GetUserList()).finally(() => setLoading(false)); // Hide loader after fetching data
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        title: "Employee Id",
        dataIndex: "employeeId",
        key: "employeeId",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Access",
        dataIndex: "access",
        key: "access",
        render: (text) => <a>{text}</a>,
      },
      {
        title: "Custom Id",
        dataIndex: "customId",
        key: "customId",
      },
      {
        title: "Created At",
        key: "createdAt",
        dataIndex: "createdAt",
        render: (text) => <a>{getAllTimes(text).formattedDate}</a>,
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <Link to={`/users/${record?._id}`}>
              <Button key={record?._id} className="bg-primary text-white">
                View
              </Button>
            </Link>
          </Space>
        ),
      },
    ],
    [],
  );

  const StatCard = ({ title, value, icon, gradient }) => (
    <Box
      p={6}
      bg="white"
      borderRadius="2xl"
      boxShadow="lg"
      position="relative"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="100px"
        h="100px"
        bgGradient={gradient}
        opacity={0.1}
        borderRadius="full"
        filter="blur(20px)"
      />
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.600">
          {title}
        </Text>
        <Box
          p={3}
          bgGradient={gradient}
          borderRadius="xl"
          color="white"
          shadow="md"
        >
          {icon}
        </Box>
      </Flex>
      <Heading size="2xl" color="gray.800" fontWeight="bold">
        {value}
      </Heading>
    </Box>
  );

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Box mb={6}>
        <Heading size="lg" color="gray.800" mb={1}>
          Admin Dashboard
        </Heading>
        <Text color="gray.500">Overview of users and system metrics.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatCard
          title="Total Users"
          value={totalUsers > 0 ? totalUsers : "0"}
          icon={<UserOutlined style={{ fontSize: "24px" }} />}
          gradient="linear(to-br, brand.primary, brand.secondary)"
        />
        <StatCard
          title="Pending Forms"
          value={0}
          icon={<FileOutlined style={{ fontSize: "24px" }} />}
          gradient="linear(to-br, orange.400, red.400)"
        />
        <StatCard
          title="Filled Forms"
          value={0}
          icon={<CheckCircleOutlined style={{ fontSize: "24px" }} />}
          gradient="linear(to-br, green.400, teal.400)"
        />
      </SimpleGrid>

      <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="md"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="gray.700">
            Recent Users
          </Heading>
          <Link to="/users">
            <Button
              variant="ghost"
              size="sm"
              colorScheme="brand"
              color="brand.primary"
              _hover={{ bg: "brand.background" }}
            >
              View All
            </Button>
          </Link>
        </Flex>
        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spin size="large" />
          </Flex>
        ) : (
          <Table
            dataSource={
              Array.isArray(UserLists) ? UserLists.slice().reverse() : []
            }
            columns={[
              ...columns.slice(0, 5),
              {
                title: "Action",
                key: "action",
                width: "120px",
                render: (_, record) => (
                  <Link to={`/users/${record?._id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="brand"
                      color="brand.primary"
                      _hover={{ bg: "brand.background" }}
                    >
                      View
                    </Button>
                  </Link>
                ),
              },
            ]}
            rowKey="employeeId"
            bordered={false}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 5, position: ["bottomCenter"] }}
            className="custom-table"
          />
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
