import {  PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRole } from "../../config/config";
import { getAllTimes, getUserId } from "../../Utils/auth";
import { useDispatch, useSelector } from "react-redux";
import { getAllWeeklyFrom } from "../../redux/userSlice";
import moment from "moment";
import Reminder from "../../Components/Reminder";

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
    (state) => state?.user?.getAllWeeklyFroms || []
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
        Boolean
      )
    ),
  ];
  const uniqueTeachers = [
    ...new Set(
      CombinedData.map((item) => item?.teacherId?.name).filter(Boolean)
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
    <div>
      <div className="contai    ner py-0 px-0">
        {UserRole[1] === getUserId()?.access && (
          <Link to="/weekly4form/create?Initiate=true">
            <button    style={{borderRadius:5}}
           className="mb-3 bg-[#1a4d2e] p-3 text-white py-2 ">
              <PlusCircleOutlined /> Form Initiation
            </button>
            {/* <Button
              className="mb-4"
              variant="solid"
              color="primary"
              size="large"
            >
              {" "}
              <PlusCircleOutlined />
              Form Initiation
            </Button> */}
          </Link>
        )}
        {UserRole[2] === getUserId()?.access && (
          <Link to="/weekly4form/create">
            <button  style={{borderRadius:5}}
           className="mb-3 bg-[#1a4d2e] p-3 text-white py-2 ">
              <PlusCircleOutlined /> Fill New Form
            </button>
            {/* <Button
              className="mb-4"
              variant="solid"
              color="primary"
              size="large"
            >
              {" "}
              <PlusCircleOutlined /> New Form
            </Button> */}
          </Link>
        )}

        <div className="flex flex-wrap gap-4">
          {/* Observer Filter */}
          {UserRole[2] === getUserId().access && (
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
          )}

          {/* Teacher Filter */}
          {UserRole[1] === getUserId().access && (
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
          )}

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

        {/* <h4 className='mt-3'>Weekly Filled Forms</h4> */}
        <Table
          columns={[
            {
              title: "Teacher Name",
              dataIndex: "teacherId",
              key: "teacherId",
              width: "160px",
              sorter: (a, b) =>
                (a?.name || "").localeCompare(b?.teacherId?.name || ""),
              render: (user) => <span>{user?.name || "N/A"}</span>,
            },
            {
              title: "Date Of Submission",
              dataIndex: "dateOfSubmission",
              key: "dateOfSubmission",
              width: "150px",
              sorter: (a, b) => new Date(a) - new Date(b?.dateOfSubmission),
              render: (date) => (
                <span>
                  {date ? getAllTimes(date).formattedDate2 : "N/A"}
                </span>
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
                <span
                  style={{
                    color: isComplete ? "green" : "red",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {isComplete ? "COMPLETED" : "NOT COMPLETED"}
                </span>
              ),
            },
            {
              title: "Action",
              key: "action",
              width: "200px",
              render: (text, record) => (
                <span key={record?._id}>
                  {record?.isCompleted ? (
                   

                    <Link to={`/weekly4form/report/${record._id}`}>
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors">
                        View Report
                      </button>
                    </Link>
                  ) : (
                    UserRole[2] === getUserId().access && (
                     

                      <Link to={`/weekly4form/create/${record?._id}`}>
                        <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors">
                          Continue Form
                        </button>
                      </Link>
                    )
                  )}
                  {UserRole[1] === getUserId().access &&
                    !record?.isCompleted && (
                      <Link
                        onClick={() => handleSendReminder(record._id)}
                       
                      >
                        <Reminder id={record?._id} type={"form4"} />
                      </Link>
                    )}
                 
                </span>
              ),
            },
          ]}
          dataSource={filteredData}
          scroll={{
            x: "max-content", // Makes the table horizontally scrollable for mobile
          }}
          pagination={false}
          rowKey={"_id"}
        />
      </div>
    </div>
  );
}

export default Weely4Page;
