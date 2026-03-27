import { DatePicker, Select, Table } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormOne_Columns4 } from "../TableColumns";
import { getAllWeeklyFromAll } from "../../../redux/userSlice";

const { Option } = Select;

function FormFourReport() {
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
    dispatch(getAllWeeklyFromAll());
  }, [dispatch]);

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
      date: date ? [moment(date).format("MM-DD-YY")] : [],
    }));
  };

  // Filter CombinedData based on selected filters
  const filteredData = CombinedData.filter((item) => {
    const itemDate = moment(item?.dateOfSubmission).format("MM-DD-YY");
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
    <div>
      {/* Filters Section */}
      <div className="flex flex-wrap gap-4">
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
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={uniqueObservers.map((observer) => ({
              label: observer,
              value: observer,
            }))}
          />
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
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={uniqueTeachers.map((teacher) => ({
              label: teacher,
              value: teacher,
            }))}
          />
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

        {/* Date Picker */}
        <div className="mb-4 w-35 select-options">
          <DatePicker
            className="w-full"
            placeholder="Select Date"
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* Data Table */}
      <Table
        columns={FormOne_Columns4}
        dataSource={filteredData}
        pagination={false}
        scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
        rowKey={(record) => record._id || Math.random()}
      />
    </div>
  );
}

export default FormFourReport;
