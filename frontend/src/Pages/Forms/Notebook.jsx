import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Spin, Table, Select, DatePicker, Space } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetcreatedByUser,
  GetobserverForms,
} from "../../redux/Form/noteBookSlice";
import { Formcolumns3 } from "../../Components/Data";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { UserRole } from "../../config/config";
import moment from "moment";
import { Box, Flex, Heading, Text, Stack } from "@chakra-ui/react";

const { Option } = Select;

function Notebook() {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const { isLoading, GetForms2 } = useSelector((state) => state?.notebook);
  // const CheckData = useSelector((state) => state?.notebook);

  // const [sortedForms, setSortedForms] = useState([]);
  // const [filters, setFilters] = useState({
  //   observerName: [],
  //   teacherID: [],
  //   className: [],
  //   section: [],
  //   subject: [],
  //   date: [],
  //   status: [],
  //   observerStatus: [],
  //   teacherStatus: [],
  // });
  // const [sortOrder, setSortOrder] = useState([]); // State for sort order
  // const Role = getUserId().access;

  // useEffect(() => {
  //   if (Role === UserRole[1]) {
  //     dispatch(GetobserverForms());
  //   } else {
  //     dispatch(GetcreatedByUser());
  //   }
  // }, [dispatch]);

  // useEffect(() => {
  //   if (Array.isArray(GetForms2)) {
  //     const sortedData = [...GetForms2].sort((a, b) => {
  //       if (a.isObserverComplete === b.isObserverComplete) {
  //         return 0; // No change in order if both are the same
  //       }
  //       return a.isObserverComplete ? 1 : -1; // Place `false` first
  //     });
  //     setSortedForms(sortedData);
  //   }
  // }, [GetForms2]);

  // const handleSort = (order) => {
  //   setSortOrder(order);
  //   let sortedData = [...sortedForms];

  //   order?.forEach((sortType) => {
  //     sortedData = sortedData?.sort((a, b) => {
  //       if (sortType === "ascend") {
  //         return (
  //           new Date(a?.grenralDetails?.DateOfObservation) -
  //           new Date(b?.grenralDetails?.DateOfObservation)
  //         );
  //       } else if (sortType === "descend") {
  //         return (
  //           new Date(b?.grenralDetails?.DateOfObservation) -
  //           new Date(a?.grenralDetails?.DateOfObservation)
  //         );
  //       } else if (sortType === "AtoZ") {
  //         return a?.grenralDetails?.className.localeCompare(
  //           b?.grenralDetails?.className
  //         );
  //       } else if (sortType === "ZtoA") {
  //         return b?.grenralDetails?.className.localeCompare(
  //           a?.grenralDetails?.className
  //         );
  //       }
  //       return 0;
  //     });
  //   });

  //   setSortedForms(sortedData);
  // };

  // const getUniqueValues = (key) => {
  //   const values = [];
  //   sortedForms.forEach((item) => {
  //     if (key === "Observer") {
  //       values.push(item?.grenralDetails?.NameofObserver?.name);
  //     } else if (key === "Teaher") {
  //       values.push(item?.createdBy?.name);
  //     } else {
  //       if (item?.grenralDetails[key]) {
  //         values.push(item?.grenralDetails[key]);
  //       }
  //     }
  //   });
  //   return [...new Set(values)];
  // };

  // const getTeachersNames = () => getUniqueValues("Teaher");
  // const getClasses = () => getUniqueValues("className");
  // const getSections = () => getUniqueValues("Section");
  // const getSubject = () => getUniqueValues("Subject");
  // const getObserverNames = () => getUniqueValues("Observer");

  // const handleFilter = (key, value) => {
  //   setFilters((prevFilters) => ({
  //     ...prevFilters,
  //     [key]: value,
  //   }));
  // };

  // const handleResetFilters = () => {
  //   setFilters({
  //     className: [],
  //     section: [],
  //     subject: [],
  //     teacherID: [],
  //     status: [],
  //     date: [],
  //     observerName: [],
  //     observerStatus: [],
  //     teacherStatus: [],
  //   });
  // };

  // const handleResetSort = () => {
  //   setSortOrder([]);
  //   setSortedForms([...GetForms2]);
  // };

  // const applyFilters = (data) => {
  //   const {
  //     className,
  //     section,
  //     subject,
  //     teacherID,
  //     status,
  //     date,
  //     observerName,
  //     matchesteacherStatus,
  //     matchesobserverStatus,
  //   } = filters;
  //   return data.filter((item) => {
  //     const matchesClassName = className.length
  //       ? className.includes(item?.grenralDetails?.className)
  //       : true;
  //     const matchesSection = section.length
  //       ? section.includes(item?.grenralDetails?.Section)
  //       : true;
  //     const matchesSubject = subject.length
  //       ? subject.includes(item?.grenralDetails?.Subject)
  //       : true;
  //     const matchesTeacherID = teacherID.length
  //       ? teacherID.includes(item?.createdBy?.name)
  //       : true;
  //     const matchesStatus = status.length
  //       ? status.includes(
  //           item?.isObserverComplete ? "COMPLETED" : "NOT COMPLETED"
  //         )
  //       : true;
  //       const matchesteacherStatus = status.length
  //       ? status.includes(
  //           item?.isTeacherComplete ? "COMPLETED" : "NOT COMPLETED"
  //         )
  //       : true;
  //       const matchesobserverStatus = status.length
  //       ? status.includes(
  //           item?.isObserverComplete ? "COMPLETED" : "NOT COMPLETED"
  //         )
  //       : true;
  //     const matchesDate = date.length
  //       ? date.some((d) =>
  //           moment(item.grenralDetails?.DateOfObservation).isSame(d, "day")
  //         )
  //       : true;
  //     const matchesObserverName = observerName.length
  //       ? observerName.includes(item?.observerName)
  //       : true;

  //     return (
  //       matchesClassName &&
  //       matchesSection &&
  //       matchesSubject &&
  //       matchesTeacherID &&
  //       matchesStatus &&
  //       matchesDate &&
  //       matchesObserverName &&
  //       matchesteacherStatus &&
  //       matchesobserverStatus
  //     );
  //   });
  // };

  // const columnsWithFilters = useMemo(() => {
  //   const uniqueValues = (key, source) => {
  //     return [
  //       ...new Set(source.flatMap((item) => (item[key] ? item[key] : []))),
  //     ].map((value) => ({
  //       text: value,
  //       value: value,
  //     }));
  //   };

  //   return Formcolumns3.map((column) => {
  //     if (
  //       ["className", "Section", "Subject", "Teaher", "Observer"].includes(
  //         column.key
  //       )
  //     ) {
  //       return {
  //         ...column,
  //         onFilter: (value, record) =>
  //           record.grenralDetails[column.dataIndex] === value,
  //       };
  //     }

  //     return column;
  //   });
  // }, [sortedForms]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    observer: [],
    teacher: [],
    class: [],
    section: [],
    subject: [],
    date: [],
    teacherStatus: [],
    observerStatus: [],
  });

  const CombinedData = useSelector((state) => state?.notebook?.GetForms2 || []);
  const { isLoading } = useSelector((state) => state?.notebook);

  const Role = getUserId().access;

  useEffect(() => {
    if (Role === UserRole[1]) {
      dispatch(GetobserverForms());
    } else {
      dispatch(GetcreatedByUser());
    }
  }, [dispatch]);

  // Dynamically get unique values for filters
  const uniqueClasses = [
    ...new Set(
      CombinedData.map((item) => item?.grenralDetails?.className).filter(
        Boolean,
      ),
    ),
  ];
  const uniqueObservers = [
    ...new Set(
      CombinedData.map(
        (item) =>
          item?.grenralDetails?.NameofObserver?.name || item?.createdBy?.name,
      ).filter(Boolean),
    ),
  ];
  const uniqueTeachers = [
    ...new Set(
      CombinedData.map(
        (item) => item?.teacherID?.name || item?.createdBy?.name,
      ).filter(Boolean),
    ),
  ];
  const uniqueDates = [
    ...new Set(
      CombinedData.map((item) =>
        moment(item?.grenralDetails?.DateOfObservation).format("YYYY-MM-DD"),
      ),
    ),
  ];
  const uniqueSections = [
    ...new Set(
      CombinedData.map((item) => item?.grenralDetails?.Section).filter(Boolean),
    ),
  ];

  const uniqueSubject = [
    ...new Set(
      CombinedData.map((item) => item?.grenralDetails?.Subject).filter(Boolean),
    ),
  ];

  // Function to handle filter change
  const handleFilterChange = (value, filterType) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // Handle date picker change
  const handleDateChange = (date, dateString) => {
    setFilters((prev) => ({ ...prev, date: date ? [dateString] : [] }));
  };

  // Filter the data based on selected filters
  const filteredData = CombinedData.filter((item) => {
    const itemDate = moment(item?.grenralDetails?.DateOfObservation).format(
      "YYYY-MM-DD",
    );

    return (
      (filters.class.length === 0 ||
        filters.class.includes(item?.grenralDetails?.className)) &&
      (filters.section.length === 0 ||
        filters.section.includes(item?.grenralDetails?.Section)) &&
      (filters.subject.length === 0 ||
        filters.subject.includes(item?.grenralDetails?.Subject)) &&
      (filters.date.length === 0 || filters.date.includes(itemDate)) &&
      (filters.teacherStatus.length === 0 ||
        filters.teacherStatus.includes(item?.isTeacherComplete)) &&
      (filters.observerStatus.length === 0 ||
        filters.observerStatus.includes(item?.isObserverComplete)) &&
      (filters.observer.length === 0 ||
        filters.observer.includes(
          item?.grenralDetails?.NameofObserver?.name || item?.createdBy?.name,
        )) &&
      (filters.teacher.length === 0 ||
        filters.teacher.includes(
          item?.teacherID?.name || item?.createdBy?.name,
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
            Notebook Checking Proforma
          </Heading>
          <Text color="gray.500">
            Manage and view notebook evaluation forms.
          </Text>
        </Box>

        <Stack direction="row" spacing={3}>
          {getUserId().access === UserRole[2] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
              onClick={() => navigate("/notebook-checking-proforma/create")}
              px={6}
            >
              Fill New Form
            </Button>
          )}

          {Role === UserRole[1] && (
            <Button
              leftIcon={<PlusCircleOutlined />}
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.text", transform: "translateY(-2px)" }}
              onClick={() =>
                navigate("/notebook-checking-proforma/form-initiation")
              }
              px={6}
            >
              Form Initiation
            </Button>
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
          {UserRole[2] === getUserId().access && (
            <Box flex="1" minW="200px">
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Observer Name"
                value={filters.observer}
                onChange={(value) => handleFilterChange(value, "observer")}
                showSearch
              >
                {uniqueObservers.map((observer, index) => (
                  <Option key={index} value={observer}>
                    {observer}
                  </Option>
                ))}
              </Select>
            </Box>
          )}
          {UserRole[1] === getUserId().access && (
            <Box flex="1" minW="200px">
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Teacher Name"
                value={filters.teacher}
                onChange={(value) => handleFilterChange(value, "teacher")}
                showSearch
              >
                {uniqueTeachers.map((teacher, index) => (
                  <Option key={index} value={teacher}>
                    {teacher}
                  </Option>
                ))}
              </Select>
            </Box>
          )}

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
          <Box flex="1" minW="150px">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Subject"
              value={filters.subject}
              onChange={(value) => handleFilterChange(value, "subject")}
            >
              {uniqueSubject.map((section, index) => (
                <Option key={index} value={section}>
                  {section}
                </Option>
              ))}
            </Select>
          </Box>
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

        <Table
          columns={Formcolumns3}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: "calc(100vh - 450px)", x: "max-content" }}
          rowKey="_id"
          className="custom-table"
        />
      </Box>
    </Box>
  );
}

export default Notebook;
