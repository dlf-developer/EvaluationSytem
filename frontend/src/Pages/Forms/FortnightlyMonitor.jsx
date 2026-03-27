import { DatePicker, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getUserId } from "../../Utils/auth";
import {
  GetFormsOne,
  GetObserverFormsOne,
} from "../../redux/Form/fortnightlySlice";
import { UserRole } from "../../config/config";
import { FormcolumnsForm1 } from "../../Components/Data";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Button, Stack } from "@chakra-ui/react";
const { Option } = Select;

function FortnightlyMonitor() {
  const Role = getUserId()?.access;
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    observer: [],
    teacher: [],
    class: [],
    section: [],
    date: [],
    teacherStatus: [],
    observerStatus: [],
  });

  useEffect(() => {
    if (Role === UserRole[1]) {
      dispatch(GetObserverFormsOne());
    } else if (Role === UserRole[2]) {
      dispatch(GetFormsOne());
    }
  }, [dispatch, Role]);
  const CombinedData = useSelector(
    (state) => state?.Forms?.getAllForms?.Combined || [],
  );

  // Dynamically get unique values for filters
  const uniqueClasses = [
    ...new Set(CombinedData.map((item) => item.className).filter(Boolean)),
  ];
  const uniqueObservers = [
    ...new Set(
      CombinedData.map(
        (item) => item.coordinatorID?.name || item.userId?.name,
      ).filter((name) => name),
    ),
  ]; // Ensure only non-falsy names are included
  const uniqueTeachers = [
    ...new Set(
      CombinedData.map(
        (item) => item?.teacherID?.name || item.userId?.name,
      ).filter((name) => name),
    ),
  ]; // Ensure only non-falsy names are included
  const uniqueDates = [...new Set(CombinedData.map((item) => item.date))];

  // Dynamically get unique sections
  const uniqueSections = [
    ...new Set(CombinedData.map((item) => item.section).filter(Boolean)), // Ensure only non-falsy values
  ];

  // Function to handle filter change for multiple values
  const handleFilterChange = (value, filterType) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // Handle date picker change
  const handleDateChange = (date, dateString) => {
    if (date) {
      // Format the selected date to match the format in the data (e.g., 'YYYY-MM-DD')
      setFilters((prev) => ({
        ...prev,
        date: [dateString], // Store as string to match with data date field
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        date: [], // Clear date filter if no date is selected
      }));
    }
  };

  // Filter CombinedData based on selected filters
  const filteredData = CombinedData.filter((item) => {
    // Format date in item for comparison
    const itemDate = moment(item.date).format("YYYY-MM-DD");

    return (
      (filters.class.length === 0 || filters.class.includes(item.className)) &&
      (filters.section.length === 0 ||
        filters.section.includes(item.section)) &&
      (filters.date.length === 0 || filters.date.includes(itemDate)) && // Compare the date as string
      (filters.teacherStatus.length === 0 ||
        filters.teacherStatus.includes(item.isTeacherComplete)) &&
      (filters.observerStatus.length === 0 ||
        filters.observerStatus.includes(item.isCoordinatorComplete)) &&
      (filters.observer.length === 0 ||
        filters.observer.some(
          (name) =>
            item?.coordinatorID?.name?.includes(name) ||
            item?.userId?.name?.includes(name),
        )) &&
      (filters.teacher.length === 0 ||
        filters.teacher.some(
          (name) =>
            item?.teacherID?.name?.includes(name) ||
            item.userId?.name.includes(name),
        ))
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
            Fortnightly Monitor
          </Heading>
          <Text color="gray.500">
            Monitor and evaluate teacher performance periodically.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {Role === UserRole[2] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
              onClick={() => navigate("/fortnightly-monitor/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}

          {Role === UserRole[1] && (
            <Link to="/fortnightly-monitor/form-initiation">
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
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {uniqueObservers.map((observer, index) => (
                  <Option key={index} value={observer}>
                    {observer}
                  </Option>
                ))}
              </Select>
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
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {uniqueTeachers.map((teacher, index) => (
                  <Option key={index} value={teacher}>
                    {teacher}
                  </Option>
                ))}
              </Select>
            </Box>
          )}

          {/* Class Filter */}
          <Box flex="1" minW="150px">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Class"
              value={filters.class}
              onChange={(value) => handleFilterChange(value, "class")}
            >
              {uniqueClasses.map((className, index) => (
                <Option key={index} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
          </Box>

          {/* Section Filter */}
          <Box flex="1" minW="150px">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Section"
              value={filters.section}
              onChange={(value) => handleFilterChange(value, "section")}
            >
              {uniqueSections.map((section, index) => (
                <Option key={index} value={section}>
                  {section}
                </Option>
              ))}
            </Select>
          </Box>

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

          {/* Observer Status Filter */}
          <Box flex="1" minW="150px">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Observer Status"
              value={filters.observerStatus}
              onChange={(value) => handleFilterChange(value, "observerStatus")}
            >
              <Option value={true}>Complete</Option>
              <Option value={false}>Incomplete</Option>
            </Select>
          </Box>

          <Box flex="1" minW="200px">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select Date"
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />
          </Box>
        </Flex>

        {/* Table Component */}
        <Table
          columns={FormcolumnsForm1}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: "calc(100vh - 450px)", x: "max-content" }}
          rowKey="_id"
        />
      </Box>
    </Box>
  );
}

export default FortnightlyMonitor;
