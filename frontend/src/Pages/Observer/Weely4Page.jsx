import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRole } from "../../config/config";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFrom } from "../../redux/userSlice";
import moment from "moment";
import Reminder from "../../Components/Reminder";
import { Box, Flex, Heading, Text, Stack, Tag } from "@chakra-ui/react";

const { Option } = Select;

function Weely4Page() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    teacher: [],
    observer: [],
    date: [],
    teacherStatus: [],
  });

  const CombinedData = useSelector(
    (state) => state?.user?.getAllWeeklyFroms || [],
  );

  useEffect(() => {
    dispatch(getAllWeeklyFrom());
  }, [dispatch]);
  const handleSendReminder = (id) => {
    // Add logic to send the reminder (e.g., API call)
  };

  const uniqueObservers = [
    ...new Set(
      CombinedData.map((item) => item?.isInitiated?.Observer?.name).filter(
        Boolean,
      ),
    ),
  ];
  const uniqueTeachers = [
    ...new Set(
      CombinedData.map((item) => item?.teacherId?.name).filter(Boolean),
    ),
  ];

  // Function to handle filter change for multiple values
  const handleFilterChange = (value, filterType) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // Handle date picker change
  const handleDateChange = (date, dateString) => {
    setFilters((prev) => ({
      ...prev,
      date: dateString ? [dateString] : [],
    }));
  };

  // Filter CombinedData based on selected filters
  const filteredData = CombinedData.filter((item) => {
    const itemDate = item?.dateOfSubmission
      ? moment(item?.dateOfSubmission).format("YYYY-MM-DD")
      : null;
    return (
      (filters.date.length === 0 || filters.date.includes(itemDate)) &&
      (filters.teacherStatus.length === 0 ||
        filters.teacherStatus.includes(item?.isCompleted)) &&
      (filters.observer.length === 0 ||
        filters.observer.includes(item?.isInitiated?.Observer?.name)) &&
      (filters.teacher.length === 0 ||
        filters.teacher.includes(item?.teacherId?.name))
    );
  });
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
            Weekly 4 Form
          </Heading>
          <Text color="gray.500">Manage and view weekly assessment forms.</Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {UserRole[2] === getUserId()?.access && (
            <Link to="/weekly4form/create">
              <Button
                leftIcon={<PlusCircleOutlined />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
                px={6}
              >
                Fill New Form
              </Button>
            </Link>
          )}

          {UserRole[1] === getUserId()?.access && (
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
        <Flex flexWrap="wrap" gap={4} mb={6}>
          {/* Observer Filter */}
          {UserRole[2] === getUserId().access && (
            <Box flex="1" minW="200px">
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Observer Name"
                value={filters.observer}
                onChange={(value) => handleFilterChange(value, "observer")}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                options={uniqueObservers.map((observer) => ({
                  label: observer,
                  value: observer,
                }))}
              />
            </Box>
          )}

          {/* Teacher Filter */}
          {UserRole[1] === getUserId().access && (
            <Box flex="1" minW="200px">
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Teacher Name"
                value={filters.teacher}
                onChange={(value) => handleFilterChange(value, "teacher")}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                options={uniqueTeachers.map((teacher) => ({
                  label: teacher,
                  value: teacher,
                }))}
              />
            </Box>
          )}

          {/* Teacher Status Filter */}
          <Box flex="1" minW="150px">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Teacher Status"
              value={filters.teacherStatus}
              onChange={(value) => handleFilterChange(value, "teacherStatus")}
            >
              <Option value={true}>Complete</Option>
              <Option value={false}>Incomplete</Option>
            </Select>
          </Box>

          {/* Date Picker */}
          <Box flex="1" minW="200px">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select Date"
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />
          </Box>
        </Flex>

        <Table
          columns={[
            {
              title: "Teacher Name",
              dataIndex: "teacherId",
              key: "teacherId",
              width: "160px",
              sorter: (a, b) =>
                (a?.teacherId?.name || "").localeCompare(
                  b?.teacherId?.name || "",
                ),
              render: (user) => <span>{user?.name || "N/A"}</span>,
            },
            {
              title: "Date Of Submission",
              dataIndex: "dateOfSubmission",
              key: "dateOfSubmission",
              width: "150px",
              sorter: (a, b) =>
                new Date(a.dateOfSubmission) - new Date(b.dateOfSubmission),
              render: (date) => (
                <span>{date ? getAllTimes(date).formattedDate2 : "N/A"}</span>
              ),
            },
            {
              title: "Teacher Status",
              dataIndex: "isCompleted",
              key: "isCompleted",
              filters: [
                { text: "Completed", value: true },
                { text: "Not Completed", value: false },
              ],
              width: "160px",
              onFilter: (value, record) => record.isCompleted === value,
              render: (isComplete) => (
                <Tag
                  colorScheme={isComplete ? "green" : "red"}
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {isComplete ? "COMPLETED" : "NOT COMPLETED"}
                </Tag>
              ),
            },
            {
              title: "Action",
              key: "action",
              width: "200px",
              render: (text, record) => (
                <Stack direction="row" spacing={2} key={record?._id}>
                  {record?.isCompleted ? (
                    <Link to={`/weekly4form/report/${record._id}`}>
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
                  ) : (
                    UserRole[2] === getUserId().access && (
                      <Link to={`/weekly4form/create/${record?._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="brand"
                          color="brand.primary"
                          _hover={{ bg: "brand.background" }}
                        >
                          Continue Form
                        </Button>
                      </Link>
                    )
                  )}
                  {UserRole[1] === getUserId().access &&
                    !record?.isCompleted && (
                      <Reminder id={record?._id} type={"form4"} />
                    )}
                </Stack>
              ),
            },
          ]}
          dataSource={filteredData}
          scroll={{ y: "calc(100vh - 450px)", x: "max-content" }}
          pagination={false}
          rowKey={"_id"}
          className="custom-table"
        />
      </Box>
    </Box>
  );
}

export default Weely4Page;
