import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Space, Spin, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllTimes } from "../../Utils/auth";
import { GetUserList } from "../../redux/userSlice";

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

  return (
    <Container>
      <Row className="my-3">
        <Col md={4}>
          <Card>
            <h2>Total Users</h2>
            <p
              className="fs-3 bg-success-subtle px-3 rounded-5"
              style={{ width: "fit-content" }}
            >
              {totalUsers > 0 ? " " : "0"}
              {totalUsers}
            </p>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <h2>Pending Forms Users</h2>
            <p
              className="fs-3 bg-success-subtle px-3 rounded-5"
              style={{ width: "fit-content" }}
            >
              {0 > 0 ? " " : "0"}
            </p>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <h2>Filled Forms</h2>
            <p
              className="fs-3 bg-success-subtle px-3 rounded-5"
              style={{ width: "fit-content" }}
            >
              {0 > 0 ? " " : "0"}
            </p>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          {loading ? (
            <Spin size="large" />
          ) : (
            <Table
              showSizeChanger={false}
              dataSource={
                Array.isArray(UserLists) ? UserLists.slice().reverse() : []
              }
              columns={columns}
              rowKey="employeeId"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
