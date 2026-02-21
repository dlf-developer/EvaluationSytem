import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { UserRole } from '../../config/config';
import { getUserId } from '../../Utils/auth';
const Role = getUserId()?.access;

export const FormOne_Columns = [
  {
    title: "Observer Name",
    dataIndex: "coordinatorID",
    key: "coordinatorID",
    width: "160px",
    sorter: (a, b) => (a.coordinatorID?.name || b?.userId?.name || "").localeCompare(b.coordinatorID?.name || b?.userId?.name || ""),
    render: (coordinator, record) => <span>{coordinator?.name || record?.userId?.name || "N/A"}</span>,
  },
  {
    title: "Teacher Name",
    dataIndex: "teacherID",
    key: "teacherID",
    width: "160px",
    sorter: (a, b) => (a?.name || b?.userId?.name).localeCompare(b.teacherID?.name || b?.userId?.name),
    render: (user, record) => <span>{user?.name || record?.userId?.name || "N/A"}</span>,
  },
  {
    title: "Class Name",
    dataIndex: "className",
    key: "className",
    width: "150px",
    sorter: (a, b) => (a.className || "").localeCompare(b.className || ""),

    onFilter: (value, record) => record.className === value,
    render: (text) => <span>{text || "N/A"}</span>,
  },
  {
    title: "Section",
    dataIndex: "section",
    key: "section",
    width: "100px",
    sorter: (a, b) => (a.section || "").localeCompare(b.section || ""),
    onFilter: (value, record) => record.section === value,
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: "120px",
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
    render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>,
  },

  {
    title: "Teacher Status",
    dataIndex: "isTeacherComplete",
    key: "isTeacherComplete",
    width: "160px",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    onFilter: (value, record) => record.isTeacherComplete === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Observer Status",
    dataIndex: "isCoordinatorComplete",
    key: "isCoordinatorComplete",
    width: "160px",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    onFilter: (value, record) => record.isCoordinatorComplete === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
   {
    title: "Teacher Score",
    dataIndex: "teacherScore",
    key: "teacherScore",
    width: "160px",
    sorter: (a, b) => a.teacherScore - b.teacherScore,
    render: (teacherScore) => <span>{teacherScore ? teacherScore : "N/A"}</span>,
  
  },
  {
    title: "Observer Score",
    dataIndex: "observerScore",
    key: "observerScore",
    width: "160px",
    sorter: (a, b) => a.observerScore - b.observerScore,
    render: (observerScore) => <span>{observerScore ? observerScore : "N/A"}</span>,
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "200px",
    render: (text, record) => (
      <Link
        to={`/fortnightly-monitor/report/${record._id}`}
      >
        <button
          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
        >
          View Report
        </button>
      </Link>
    ),
  },
];


export const FormOne_Columns2 = [
  {
    title: "Observer Name",
    dataIndex: "createdBy", // Fixed typo from 'grenralDetails' to 'generalDetails'
    key: "createdBy",
    width: '160px',
    sorter: (a, b) => (a?.name || "").localeCompare(b?.createdBy?.name || ""),
    render: (text, record) => (
      <a>
        {text.name || "N/A"}
      </a>
    ),
  },
  {
    title: "Teacher Name",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: '160px',
    sorter: (a, b) => (a?.NameoftheVisitingTeacher?.name || "").localeCompare(b.grenralDetails?.NameoftheVisitingTeacher?.name || ""),
    render: (user) => <span>{user?.NameoftheVisitingTeacher?.name || "N/A"}</span>,
  },
  {
    title: "Class Name",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "150px",
    sorter: (a, b) => (a.className || "").localeCompare(b.grenralDetails?.className || ""),
    onFilter: (value, record) => record.grenralDetails.className === value,
    render: (text) => <span>{text.className || "N/A"}</span>,
  },
  {
    title: "Section",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "100px",
    sorter: (a, b) => (a.Section || "").localeCompare(b.grenralDetails?.Section || ""),
    onFilter: (value, record) => record.grenralDetails.Section === value,
    render: (text) => <span>{text.Section || "N/A"}</span>,
  },
  {
    title: "Subject",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "100px",
    sorter: (a, b) => (a?.Subject || "").localeCompare(b?.grenralDetails?.Subject || ""),
    onFilter: (value, record) => record.grenralDetails?.Subject === value,
    render: (text) => <span>{text.Subject}</span>,
  },
  {
    title: "Date",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "120px",
    sorter: (a, b) => new Date(a.DateOfObservation) - new Date(b.grenralDetails.DateOfObservation),
    render: (date) => <span>{date ? new Date(date?.DateOfObservation).toLocaleDateString() : "N/A"}</span>,
  },
  {
    title: "Total Score",
    dataIndex: "totalScores",
    key: "totalScores",
    width: "120px",
    sorter: (a, b) => a.totalScores - b.totalScores,
    render: (totalScores) => <span>{totalScores ?   totalScores : "N/A"}</span>,
  },

  {
    title: "Teacher Status",
    dataIndex: "isTeacherCompletes",
    key: "isTeacherCompletes",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    width: "160px",
    onFilter: (value, record) => record.isTeacherCompletes === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Observer Status",
    dataIndex: "isObserverCompleted",
    key: "isObserverCompleted",
    width: "160px",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    onFilter: (value, record) => record.isObserverCompleted === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "200px",
    render: (text, record) => (
      <Link
        to={`/classroom-walkthrough/report/${record._id}`}
      >
        <button
          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
        >
          View Report
        </button>
      </Link>
    ),
  },
];

export const FormOne_Columns3 = [
  {
    title: "Observer Name",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: '160px',
    sorter: (a, b) => (a?.NameofObserver?.name || b?.createdBy?.name || "").localeCompare(b?.generalDetails?.NameofObserver?.name || b?.createdBy?.name || ""),
    render: (user, record) => <span>{user?.NameofObserver?.name || record?.generalDetails?.NameofObserver?.name}</span>,
  },
  {
    title: "Teacher Name",
    dataIndex: "teacherID",
    key: "teacherID",
    width: '160px',
    sorter: (a, b) => (a?.name || b?.createdBy?.name || "").localeCompare(b?.teacherID?.name || b?.createdBy?.name || ""),
    render: (user, record) => <span>{user?.name || record?.createdBy?.name}</span>,
  },
  {
    title: "Grade",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "150px",
    sorter: (a, b) => (a.className || "").localeCompare(b.grenralDetails?.className || ""),
    onFilter: (value, record) => record.grenralDetails.className === value,
    render: (text) => <span>{text.className || "N/A"}</span>,
  },
  {
    title: "Section",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "100px",
    sorter: (a, b) => (a.Section || "").localeCompare(b.grenralDetails?.Section || ""),
    onFilter: (value, record) => record.grenralDetails.Section === value,
    render: (text) => <span>{text.Section || "N/A"}</span>,
  },
  {
    title: "Subject",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "100px",
    sorter: (a, b) => (a.Subject || "").localeCompare(b.grenralDetails?.Subject || ""),
    onFilter: (value, record) => record.grenralDetails.Subject === value,
    render: (text) => <span>{text.Subject || "N/A"}</span>,
  },
  {
    title: "Observation Date",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    width: "180px",
    sorter: (a, b) => new Date(a.DateOfObservation) - new Date(b.grenralDetails.DateOfObservation),
    render: (date) => <span>{date ? new Date(date?.DateOfObservation).toLocaleDateString() : "N/A"}</span>,
  },
  {
    title: "Teacher Status",
    dataIndex: "isTeacherComplete",
    key: "isTeacherComplete",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    width: "160px",
    onFilter: (value, record) => record.isTeacherCompletes === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Observer Status",
    dataIndex: "isObserverComplete",
    key: "isObserverComplete",
    width: "160px",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    onFilter: (value, record) => record.isObserverCompleted === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Reflection Status",
    dataIndex: "isReflation",
    key: "isReflation",
    width: "160px",
    filters: [
      { text: "Completed", value: true },
      { text: "Not Completed", value: false },
    ],
    onFilter: (value, record) => record.isReflation === value,
    render: (isComplete) => (
      <span
        style={{
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "200px",
    render: (text, record) => (
      <Link
        to={`/notebook-checking-proforma/report/${record._id}`}
      >
        <button
          className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
        >
          View Report
        </button>
      </Link>
    ),
  },
];

export const FormOne_Columns4 = [
  {
    title: "Observer Name",
    dataIndex: "isInitiated",
    key: "isInitiated",
    width: '160px',
    sorter: (a, b) => (a?.Observer?.name || "").localeCompare(b?.isInitiated?.Observer?.name || ""),
    render: (user) => <span>{user?.Observer?.name || "N/A"}</span>,
  },
  {
    title: "Teacher Name",
    dataIndex: "teacherId",
    key: "teacherId",
    width: '160px',
    sorter: (a, b) => (a?.name || "").localeCompare(b?.teacherId?.name || ""),
    render: (user) => <span>{user?.name || "N/A"}</span>,
  },
  {
    title: "Date Of Submission",
    dataIndex: "dateOfSubmission",
    key: "dateOfSubmission",
    width: "150px",
    sorter: (a, b) => new Date(a) - new Date(b?.dateOfSubmission),
    render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>,
  },
  // {
  //   title: "Date Of Submission",
  //   dataIndex: "dateOfSubmission",
  //   key: "dateOfSubmission",
  //   width:"120px",
  //   sorter: (a, b) => new Date(a) - new Date(b?.dateOfSubmission),
  //   render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>,
  // },
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
          color: isComplete ? 'green' : 'red',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        {isComplete ? "COMPLETED" : "NOT COMPLETED"}
      </span>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "200px",
    render: (text, record) => (
      <Link
        to={`/weekly4form/report/${record._id}`}
      >
        <button
          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
        >
          View Report
        </button>
      </Link>
    ),
  },
];