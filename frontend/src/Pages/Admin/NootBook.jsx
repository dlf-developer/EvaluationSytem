import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Spin, Table, Select, DatePicker, Space } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedByUser,
  getNootbookForms,
  GetobserverForms,
} from "../../redux/Form/noteBookSlice";
import { AdminFormcolumns3, Formcolumns3 } from "../../Components/Data";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import moment from "moment";
import { Box, Flex, Heading, Text, Stack, SimpleGrid } from "@chakra-ui/react";

const { Option } = Select;

function NoteBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { GetForms2, isLoading } =
    useSelector((state) => state?.notebook) || [];

  const [sortedForms, setSortedForms] = useState([]);
  const [filters, setFilters] = useState({
    className: [],
    section: [],
    teacherID: [],
    status: [],
    date: [],
    observerName: [],
  });
  const [sortOrder, setSortOrder] = useState([]); // State for sort order
  const Role = getUserId().access;

  useEffect(() => {
    dispatch(getNootbookForms());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(GetForms2)) {
      const sortedData = [...GetForms2].sort((a, b) => {
        if (a.isObserverComplete === b.isObserverComplete) {
          return 0; // No change in order if both are the same
        }
        return a.isObserverComplete ? 1 : -1; // Place `false` first
      });
      setSortedForms(sortedData);
    }
  }, [GetForms2]);

  const handleSort = (order) => {
    setSortOrder(order);
    let sortedData = [...sortedForms];

    order?.forEach((sortType) => {
      sortedData = sortedData?.sort((a, b) => {
        if (sortType === "ascend") {
          return (
            new Date(a?.grenralDetails?.DateOfObservation) -
            new Date(b?.grenralDetails?.DateOfObservation)
          );
        } else if (sortType === "descend") {
          return (
            new Date(b?.grenralDetails?.DateOfObservation) -
            new Date(a?.grenralDetails?.DateOfObservation)
          );
        } else if (sortType === "AtoZ") {
          return a?.grenralDetails?.className.localeCompare(
            b?.grenralDetails?.className,
          );
        } else if (sortType === "ZtoA") {
          return b?.grenralDetails?.className.localeCompare(
            a?.grenralDetails?.className,
          );
        }
        return 0;
      });
    });

    setSortedForms(sortedData);
  };

  const getUniqueValues = (key) => {
    const values = [];
    sortedForms.forEach((item) => {
      if (key === "Observer") {
        values.push(item?.grenralDetails?.NameofObserver?.name);
      } else if (key === "Teaher") {
        values.push(item?.createdBy?.name);
      } else {
        if (item?.grenralDetails[key]) {
          values.push(item?.grenralDetails[key]);
        }
      }
    });
    return [...new Set(values)];
  };

  const getTeachersNames = () => getUniqueValues("Teaher");
  const getClasses = () => getUniqueValues("className");
  const getSections = () => getUniqueValues("Section");
  const getObserverNames = () => getUniqueValues("Observer");

  const handleFilter = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      className: [],
      section: [],
      teacherID: [],
      status: [],
      date: [],
      observerName: [],
    });
  };

  const handleResetSort = () => {
    setSortOrder([]);
    setSortedForms([...GetForms2]);
  };

  const applyFilters = (data) => {
    const { className, section, teacherID, status, date, observerName } =
      filters;
    return data.filter((item) => {
      const matchesClassName = className.length
        ? className.includes(item?.grenralDetails?.className)
        : true;
      const matchesSection = section.length
        ? section.includes(item?.grenralDetails?.Section)
        : true;
      const matchesTeacherID = teacherID.length
        ? teacherID.includes(item?.createdBy?.name)
        : true;
      const matchesStatus = status.length
        ? status.includes(
            item?.isObserverComplete ? "COMPLETED" : "NOT COMPLETED",
          )
        : true;
      const matchesDate = date.length
        ? date.some((d) =>
            moment(item.grenralDetails?.DateOfObservation).isSame(d, "day"),
          )
        : true;
      const matchesObserverName = observerName.length
        ? observerName.includes(item?.observerName)
        : true;

      return (
        matchesClassName &&
        matchesSection &&
        matchesTeacherID &&
        matchesStatus &&
        matchesDate &&
        matchesObserverName
      );
    });
  };

  const columnsWithFilters = useMemo(() => {
    const uniqueValues = (key, source) => {
      return [
        ...new Set(source.flatMap((item) => (item[key] ? item[key] : []))),
      ].map((value) => ({
        text: value,
        value: value,
      }));
    };

    return AdminFormcolumns3.map((column) => {
      if (
        ["className", "Section", "Subject", "Teaher", "Observer"].includes(
          column.key,
        )
      ) {
        return {
          ...column,
          onFilter: (value, record) =>
            record.grenralDetails[column.dataIndex] === value,
        };
      }

      return column;
    });
  }, [sortedForms]);

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.7)"
          zIndex={9999}
        >
          <Spin size="large" />
        </Flex>
      )}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500">
            Manage, filter, and review all notebook checking evaluations.
          </Text>
        </Box>

        {getUserId().access === UserRole[2] && (
          <Button
            leftIcon={<PlusCircleOutlined />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
            onClick={() => navigate("/NoteBook-checking-proforma/create")}
            px={6}
          >
            Fill New Form
          </Button>
        )}
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
        <Box mb={6}>
          <Text fontWeight="600" color="gray.700" mb={4}>
            Filter Records
          </Text>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 6 }}
            spacing={4}
            alignItems="center"
          >
            <Box>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Teacher"
                value={filters.teacherID}
                onChange={(value) => handleFilter("teacherID", value)}
                options={getTeachersNames().map((teacher) => ({
                  value: teacher,
                  label: teacher,
                }))}
              />
            </Box>
            <Box>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Observer"
                value={filters.observerName}
                onChange={(value) => handleFilter("observerName", value)}
                options={getObserverNames().map((observer) => ({
                  value: observer,
                  label: observer,
                }))}
              />
            </Box>
            <Box>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Class"
                value={filters?.className}
                onChange={(value) => handleFilter("className", value)}
                options={getClasses().map((className) => ({
                  value: className,
                  label: className,
                }))}
              />
            </Box>
            <Box>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Section"
                value={filters.section}
                onChange={(value) => handleFilter("section", value)}
                options={getSections().map((section) => ({
                  value: section,
                  label: section,
                }))}
              />
            </Box>
            <Box>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select Date"
                onChange={(date) =>
                  handleFilter("date", date ? [date.format("YYYY-MM-DD")] : [])
                }
              />
            </Box>
            <Box>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Select Status"
                value={filters.status}
                onChange={(value) => handleFilter("status", value)}
                options={[
                  { value: "COMPLETED", label: "Completed" },
                  { value: "NOT COMPLETED", label: "Not Completed" },
                ]}
              />
            </Box>
          </SimpleGrid>

          <Flex
            mt={6}
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={4}
          >
            <Stack direction="row" spacing={3} align="center">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "200px" }}
                placeholder="Sort Order"
                value={sortOrder}
                onChange={handleSort}
              >
                <Option value="ascend">Date Ascending</Option>
                <Option value="descend">Date Descending</Option>
                <Option value="AtoZ">A to Z</Option>
                <Option value="ZtoA">Z to A</Option>
              </Select>
              <Button variant="ghost" size="sm" onClick={handleResetSort}>
                Reset Sort
              </Button>
            </Stack>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
            >
              Reset All Filters
            </Button>
          </Flex>
        </Box>

        <Table
          columns={columnsWithFilters}
          dataSource={applyFilters(sortedForms)}
          bordered={false}
          scroll={{ y: "calc(100vh - 500px)", x: "max-content" }}
          pagination={{ pageSize: 10, responsive: true }}
          className="custom-table"
        />
      </Box>
    </Box>
  );
}

export default NoteBook;
