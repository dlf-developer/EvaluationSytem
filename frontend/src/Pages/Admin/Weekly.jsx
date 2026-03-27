import { PlusCircleFilled, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Table } from "antd";
import { Box, Heading, Text, Stack, Flex, Tag } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserRole } from "../../config/config";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFrom, getAllWeeklyFromAll } from "../../redux/userSlice";

function Weekly() {
  const dispatch = useDispatch();
  const { getAllWeeklyFroms, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    dispatch(getAllWeeklyFromAll());
  }, []);

  const ReverseData = () => {
    if (getAllWeeklyFroms) {
      if (Array.isArray(getAllWeeklyFroms)) {
        const reversedData = [...getAllWeeklyFroms].reverse(); // Safely reverse if it's an array
        return reversedData.map((item) => ({
          ...item,
          key: item._id, // Add a unique key for each record
        }));
      } else {
        console.error("getAllWeeklyFroms is not an array:", getAllWeeklyFroms);
        return []; // Return an empty array as a fallback
      }
    }
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
            Weekly Monitoring Forms
          </Heading>
          <Text color="gray.500">Track and manage weekly evaluations.</Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {UserRole[1] === getUserId()?.access &&
            currentPath !== "/reports" && (
              <Link to="/weekly4form/create?Initiate=true">
                <Button
                  leftIcon={<PlusCircleOutlined />}
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
                  px={6}
                >
                  Form Initiation
                </Button>
              </Link>
            )}
          {UserRole[2] === getUserId()?.access && (
            <Link to="/weekly4form/create">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
                px={6}
              >
                New Form
              </Button>
            </Link>
          )}
        </Stack>
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
        <Table
          columns={[
            {
              title:
                UserRole[1] === getUserId().access ? "Teacher" : "Observer",
              dataIndex:
                UserRole[1] === getUserId().access
                  ? `teacherId`
                  : "isInitiated",
              key:
                UserRole[1] === getUserId().access
                  ? `teacherId`
                  : "isInitiated",
              render: (text, record) => (
                <span key={record?._id}>{text?.Observer?.name || "N/A"}</span>
              ),
            },
            {
              title: "Initiated Date",
              dataIndex: "date",
              key: "date",
              sorter: (a, b) => new Date(a.date) - new Date(b.date),
              render: (text, record) => (
                <span key={record?._id}>
                  {text ? getAllTimes(text).formattedDate2 : "N/A"}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "isCompleted",
              key: "isCompleted",
              filters: [
                { text: "Completed", value: true },
                { text: "Pending", value: false },
              ],
              onFilter: (value, record) => record.isCompleted === value,
              render: (text, record) => (
                <Tag
                  key={record?._id}
                  colorScheme={text ? "green" : "red"}
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {text ? "COMPLETED" : "PENDING"}
                </Tag>
              ),
            },
            {
              title: "Action",
              key: "action",
              width: "150px",
              render: (text, record) => (
                <span key={record?._id}>
                  {record?.isCompleted && (
                    <Link to={`/weekly4form/report/${record?._id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="brand"
                        color="brand.primary"
                        _hover={{ bg: "brand.background" }}
                      >
                        View Report
                      </Button>
                    </Link>
                  )}
                </span>
              ),
            },
          ]}
          dataSource={ReverseData()}
          bordered={false}
          scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
          pagination={{
            pageSize: 10,
            responsive: true,
          }}
          className="custom-table"
        />
      </Box>
    </Box>
  );
}

export default Weekly;
