import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Space,
  Table,
  Upload,
  Spin,
  Dropdown,
  Menu,
} from "antd";
import {
  UploadOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  CloudFilled,
  DownloadOutlined,
  DeleteFilled,
  FilterOutlined,
} from "@ant-design/icons";

import { Box, Flex, Heading, Text, HStack, Stack, Tag } from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { BulkUserCreate, DeleteUser, GetUserList } from "../../redux/userSlice";
import { getAllTimes } from "../../Utils/auth";
import CreateUserForm from "../../Components/CreateUserForm";
import { Link } from "react-router-dom";
import { columnsCreate } from "../../Components/Data";
import { useServerPagination } from "../../hooks/useServerPagination";
import DynamicTable from "../../Components/DynamicTable";

function Users() {
  const [size, setSize] = useState("large");
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const dispatch = useDispatch();

  const {
    params,
    handleTableChange,
    handleSearch,
    handleCustomFilter,
    refresh,
  } = useServerPagination(GetUserList);

  const UserLists = useSelector((state) => state?.user?.data?.data || []);
  const totalUsers = useSelector((state) => state?.user?.data?.total || 0);
  const loading = useSelector((state) => state?.user?.loading);

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
        render: (text) => <a>{getAllTimes(text).formattedDate2}</a>,
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <Link to={`${record?._id}`}>
              <Button key={record?._id} className="bg-primary text-white">
                View
              </Button>
            </Link>
            <Button
              onClick={() => DeleteUserRow(record?._id)}
              className="bg-danger text-white"
              key={record}
            >
              <DeleteFilled /> Delete
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  const [loadingAction, setLoadingAction] = useState(false);

  const handleFilterByAccess = ({ key }) => {
    handleCustomFilter("access", key);
  };

  const accessMenu = (
    <Menu onClick={handleFilterByAccess}>
      <Menu.Item key="Superadmin">Super Admin</Menu.Item>
      <Menu.Item key="Teacher">Teacher</Menu.Item>
      <Menu.Item key="Observer">Observer</Menu.Item>
      <Menu.Item key={""}>Clear Filter</Menu.Item>
    </Menu>
  );

  const showModal = () => setOpen(true);
  const showModal2 = () => setOpen2(true);

  const handleCancel = () => setOpen(false);

  const generateRandomString = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  };

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const isValid = jsonData.every((row) => {
          if (!row.customId) row.customId = generateRandomString();
          return [
            "employeeId",
            "customId",
            "name",
            "email",
            "mobile",
            "access",
            "designation",
            "password",
          ].every((key) => key in row && row[key] !== null && row[key] !== "");
        });

        if (!isValid) {
          message.error("Invalid file structure. Please check the template.");
          return;
        }

        setExcelData(jsonData);
        message.success("File processed successfully.");
      } catch (error) {
        message.error("Error processing file.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const uploadToAPI = () => {
    if (excelData.length === 0) {
      message.warning("No data to upload. Please upload a valid file.");
      return;
    }
    setLoadingAction(true); // Show loader
    dispatch(BulkUserCreate(excelData))
      .then(() => {
        message.success("Data uploaded successfully.");
        refresh();
      })
      .catch(() => message.error("Failed to upload data."))
      .finally(() => {
        setLoadingAction(false); // Hide loader
        setOpen2(false);
      });
  };

  const DeleteUserRow = (userId) => {
    setLoadingAction(true); // Show loader
    dispatch(DeleteUser(userId))
      .then(() => {
        message.success("User deleted successfully.");
        refresh();
      })
      .catch(() => message.error("Failed to delete user."))
      .finally(() => setLoadingAction(false)); // Hide loader
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            User Management
          </Heading>
          <Text color="gray.500">
            Manage all users, view details, and perform bulk uploads.
          </Text>
        </Box>

        <HStack spacing={3} wrap="wrap">
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
            onClick={showModal}
            px={6}
          >
            Create New User
          </Button>
          <Button
            leftIcon={<CloudFilled />}
            variant="outline"
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{ bg: "brand.background" }}
            onClick={showModal2}
          >
            Bulk Upload
          </Button>
        </HStack>
      </Flex>

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
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          mb={6}
          gap={4}
        >
          <Box w={{ base: "100%", md: "320px" }}>
            <Input
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Search users..."
              value={params.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Box>

          <Dropdown overlay={accessMenu}>
            <Button
              variant="ghost"
              leftIcon={<FilterOutlined />}
              color="gray.600"
            >
              Filter By Access
            </Button>
          </Dropdown>
        </Flex>

        <DynamicTable
          columns={[
            ...columns.slice(0, 2),
            {
              title: "Access",
              dataIndex: "access",
              key: "access",
              render: (text) => (
                <Tag
                  colorScheme={text === "Superadmin" ? "purple" : "blue"}
                  variant="subtle"
                >
                  {text}
                </Tag>
              ),
            },
            ...columns.slice(3, 5),
            {
              title: "Action",
              key: "action",
              width: "200px",
              render: (_, record) => (
                <Stack direction="row" spacing={2}>
                  <Link to={`${record?._id}`}>
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
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    color="red.600"
                    _hover={{ bg: "red.50" }}
                    leftIcon={<DeleteFilled />}
                    onClick={() => DeleteUserRow(record?._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              ),
            },
          ]}
          data={UserLists}
          total={totalUsers}
          currentPage={params.page}
          pageSize={params.limit}
          loading={loading || loadingAction}
          onChange={handleTableChange}
          rowKey="employeeId"
        />
      </Box>

      <Modal
        footer={null}
        title={
          <Text fontSize="xl" fontWeight="bold">
            Create New User
          </Text>
        }
        open={open}
        confirmLoading={loadingAction}
        onCancel={handleCancel}
      >
        <CreateUserForm onCancel={handleCancel} />
      </Modal>

      <Modal
        footer={null}
        title={
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Bulk Upload Users
          </Text>
        }
        open={open2}
        onCancel={() => setOpen2(false)}
        width={800}
        centered
      >
        <Stack direction={{ base: "column", sm: "row" }} spacing={4} mb={6}>
          <Upload
            accept=".xlsx, .xls"
            beforeUpload={handleExcelUpload}
            showUploadList={false}
          >
            <Button
              size={size}
              icon={<UploadOutlined />}
              style={{ borderRadius: "8px", width: "100%" }}
            >
              Select Excel File
            </Button>
          </Upload>
          <Button
            size={size}
            type="primary"
            onClick={uploadToAPI}
            style={{ borderRadius: "8px" }}
          >
            OneClick Upload
          </Button>
        </Stack>
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
          mb={4}
        >
          <Table
            dataSource={excelData}
            columns={columnsCreate}
            rowKey="employeeId"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Box>
        <Link to="/assets/Template.xlsx" target="_blank" download>
          <Button type="link" icon={<DownloadOutlined />}>
            Download Excel Template
          </Button>
        </Link>
      </Modal>
    </Box>
  );
}

export default Users;
