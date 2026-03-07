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
import { Container } from "react-bootstrap";
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
    <div>
      <Container>
        <div className="d-flex gap-3 py-4 col-md-8">
          <Button
            onClick={showModal}
            type="primary"
            icon={<PlusCircleOutlined />}
            size={size}
          >
            Create New User
          </Button>
          <Button
            onClick={showModal2}
            type="primary"
            icon={<CloudFilled />}
            size={size}
          >
            Bulk Upload
          </Button>
          <Dropdown overlay={accessMenu}>
            <Button size="large" icon={<FilterOutlined />}>
              Filter By Access
            </Button>
          </Dropdown>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search"
            value={params.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <DynamicTable
          columns={columns}
          data={UserLists}
          total={totalUsers}
          currentPage={params.page}
          pageSize={params.limit}
          loading={loading || loadingAction}
          onChange={handleTableChange}
          rowKey="employeeId"
        />
      </Container>
      <Modal
        footer={null}
        title="Create New User"
        open={open}
        confirmLoading={loadingAction}
        onCancel={handleCancel}
      >
        <CreateUserForm onCancel={handleCancel} />
      </Modal>

      <Modal
        footer={null}
        title="Bulk Upload Users"
        open={open2}
        onCancel={() => setOpen2(false)}
        className="w-50"
      >
        <div className="d-flex gap-3 align-items-center mt-3 mb-3">
          <Upload
            accept=".xlsx, .xls"
            beforeUpload={handleExcelUpload}
            showUploadList={false}
          >
            <Button size={size} icon={<UploadOutlined />}>
              Select Excel File
            </Button>
          </Upload>
          <Button size={size} type="primary" onClick={uploadToAPI}>
            OneClick Upload
          </Button>
        </div>
        <Table
          dataSource={excelData}
          columns={columnsCreate}
          rowKey="employeeId"
        />
        <Link to="/assets/Template.xlsx" target="_blank" download>
          <DownloadOutlined /> Download Excel Template
        </Link>
      </Modal>
    </div>
  );
}

export default Users;
