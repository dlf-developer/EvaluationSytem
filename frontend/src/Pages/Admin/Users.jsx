import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Upload,
  Spin,
  Table,
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
import SmartTable from "../../Components/SmartTable";
import { getUserColumns } from "../../Components/SmartTable/tableColumns";

function Users() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await dispatch(GetUserList({ page: 1, limit: 9999 }));
      if (res?.payload?.data) setAllUsers(res.payload.data);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const DeleteUserRow = (userId) => {
    setLoadingAction(true);
    dispatch(DeleteUser(userId))
      .then(() => {
        message.success("User deleted successfully.");
        fetchUsers();
      })
      .catch(() => message.error("Failed to delete user."))
      .finally(() => setLoadingAction(false));
  };

  const columns = useMemo(
    () => getUserColumns({ onDelete: DeleteUserRow }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const generateRandomString = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const isValid = jsonData.every((row) => {
          if (!row.customId) row.customId = generateRandomString();
          return ["employeeId", "customId", "name", "email", "mobile", "access", "designation", "password"].every(
            (key) => key in row && row[key] !== null && row[key] !== ""
          );
        });
        if (!isValid) {
          message.error("Invalid file structure. Please check the template.");
          return;
        }
        setExcelData(jsonData);
        message.success("File processed successfully.");
      } catch {
        message.error("Error processing file.");
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
    setLoadingAction(true);
    dispatch(BulkUserCreate(excelData))
      .then(() => { message.success("Data uploaded successfully."); fetchUsers(); })
      .catch(() => message.error("Failed to upload data."))
      .finally(() => { setLoadingAction(false); setOpen2(false); });
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>User Management</Heading>
          <Text color="gray.500">Manage all users, view details, and perform bulk uploads.</Text>
        </Box>

        <HStack spacing={3} wrap="wrap">
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
            onClick={() => setOpen(true)}
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
            onClick={() => setOpen2(true)}
          >
            Bulk Upload
          </Button>
        </HStack>
      </Flex>

      <SmartTable
        title="All Users"
        columns={columns}
        data={allUsers}
        loading={loadingUsers || loadingAction}
        rowKey="employeeId"
        pageSize={10}
      />

      {/* Create User Modal */}
      <Modal
        footer={null}
        title={<Text fontSize="xl" fontWeight="bold">Create New User</Text>}
        open={open}
        confirmLoading={loadingAction}
        onCancel={() => setOpen(false)}
      >
        <CreateUserForm onCancel={() => setOpen(false)} />
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        footer={null}
        title={<Text fontSize="xl" fontWeight="bold" mb={4}>Bulk Upload Users</Text>}
        open={open2}
        onCancel={() => setOpen2(false)}
        width={800}
        centered
      >
        <Stack direction={{ base: "column", sm: "row" }} spacing={4} mb={6}>
          <Upload accept=".xlsx, .xls" beforeUpload={handleExcelUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>
              Select Excel File
            </Button>
          </Upload>
          <Button type="primary" onClick={uploadToAPI} style={{ borderRadius: "8px" }}>
            OneClick Upload
          </Button>
        </Stack>
        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden" mb={4}>
          <Table
            dataSource={excelData}
            columns={columnsCreate}
            rowKey="employeeId"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Box>
        <Link to="/assets/Template.xlsx" target="_blank" download>
          <Button type="link" icon={<DownloadOutlined />}>Download Excel Template</Button>
        </Link>
      </Modal>
    </Box>
  );
}

export default Users;
