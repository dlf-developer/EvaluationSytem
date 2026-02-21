import { DatePicker, Select, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { FormOne_Columns } from '../TableColumns';
import { useDispatch, useSelector } from 'react-redux';
import { GetAllFormsForAdmin } from '../../../redux/Form/fortnightlySlice';
import moment from 'moment';
const { Option } = Select;
function FormOneReport() {

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
    dispatch(GetAllFormsForAdmin());
  }, [dispatch]);

  const CombinedData = useSelector((state) => state?.Forms?.getAllAdminForms || []);

  // Dynamically get unique values for filters
  const uniqueClasses = [
    ...new Set(CombinedData.map((item) => item.className).filter(Boolean)),
  ];
  const uniqueObservers = [
    ...new Set(
      CombinedData.map((item) => item.coordinatorID?.name || item.userId?.name).filter(
        (name) => name
      )
    ),
  ]; // Ensure only non-falsy names are included
  const uniqueTeachers = [
    ...new Set(
      CombinedData.map((item) => item?.teacherID?.name || item.userId?.name).filter((name) => name)
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

  //   // Function to reset all filters
  //   const resetFilters = () => {
  //     setFilters({
  //       observer: [],
  //       teacher: [],
  //       class: [],
  //       section: [],
  //       date: [],
  //       teacherStatus: [],
  //       observerStatus: [],
  //     });
  //   };

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
        filters.observer.some((name) =>
          item?.coordinatorID?.name?.includes(name) || item?.userId?.name?.includes(name)
        ))
      &&
      (filters.teacher.length === 0 ||
        filters.teacher.some((name) => item?.teacherID?.name?.includes(name) || item.userId?.name.includes(name)))
    );
  });
  return (
    <div>
      {/* Filters Section */}
      <div className=" flex flex-wrap gap-4">
        {/* Observer Filter */}
        <div className="w-35 select-options">
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
        </div>

        {/* Teacher Filter */}
        <div className="w-35 select-options">
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
        </div>

        {/* Class Filter */}
        <div className="w-35 select-options">
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
        </div>

        {/* Section Filter */}
        <div className="w-35 select-options">
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
        </div>

        {/* Teacher Status Filter */}
        <div className="w-35 select-options">
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
        </div>

        {/* Observer Status Filter */}
        <div className="w-35 select-options">
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
        </div>
        <div className="mb-4 w-35 select-options">
          <DatePicker
            className='w-full'
            placeholder="Select Date"
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
        </div>
        {/* <Button type="default" onClick={resetFilters}>
            Reset Filters
          </Button> */}
      </div>

      {/* Table Component */}
      <Table
        columns={FormOne_Columns}
        dataSource={filteredData}
        pagination={false}
        scroll={{ y: 70 * 5 }}
        rowKey="_id"
      />
    </div>
  )
}

export default FormOneReport