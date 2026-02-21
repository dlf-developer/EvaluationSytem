import { Button, Space, Tag } from "antd";
import { Link } from "react-router-dom";
import {
  AppstoreAddOutlined,
  BookFilled,
  DatabaseFilled,
  FormatPainterFilled,
  FormOutlined,
  PieChartOutlined,
  SignatureOutlined,
  UserAddOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { getAllTimes, getUserId } from "../Utils/auth";
import { UserRole } from "../config/config";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsCloudSlash } from "react-icons/bs";
import { FormOneReminder } from "../redux/userSlice";
import Reminder from "./Reminder";

// import { SiGoogleclassroom } from "react-icons/si";

const Role = getUserId()?.access;

export const Menu = {
  Superadmin: [
    { name: "Dashboard", route: "/dashboard", icon: <AppstoreAddOutlined /> },
    { name: "Reports", route: "/reports", icon: <PieChartOutlined /> },
    { name: "User", route: "/users", icon: <UserAddOutlined /> },
    { name: "Profile", route: "/profile", icon: <UserOutlined /> },
    {
      name: "Class / Section",
      route: "/class-section",
      icon: <BsCloudSlash />,
    },
    { label: "Forms" },
    {
      name: "Fortnightly Monitor",
      route: "/fortnightly-monitor",
      icon: <FormOutlined />,
    },
    {
      name: "Classroom Walkthrough",
      route: "/classroom-walkthrough",
      icon: <SignatureOutlined />,
    },
    {
      name: "Notebook Checking",
      route: "/notebook-checking-proforma",
      icon: <BookFilled />,
    }
    ,
    {
      name: "Learning Progress Checklist",
      route: "weekly4form",
      icon: <DatabaseFilled />,
    },
  ],
  Observer: [
    { name: "Dashboard", route: "/dashboard", icon: <AppstoreAddOutlined /> },
    { name: "Reports", route: "/reports", icon: <PieChartOutlined /> },
    { name: "Profile", route: "/profile", icon: <UserOutlined /> },
    { label: "Forms" },
    {
      name: "Fortnightly Monitor",
      route: "/fortnightly-monitor",
      icon: <FormOutlined />,
    },
    {
      name: "Classroom Walkthrough",
      route: "/classroom-walkthrough",
      icon: <SignatureOutlined />,
    },
    {
      name: "Notebook Checking",
      route: "/notebook-checking-proforma",
      icon: <BookFilled />,
    },

    {
      name: " Learning Progress Checklist",
      route: "weekly4form",
      icon: <DatabaseFilled />,
    },
    {
      name: "Wing Coordinator",
      route: "/wing-coordinator",
      icon: <BookFilled />,
    },
  ],
  Teacher: [
    { name: "Dashboard", route: "/dashboard", icon: <AppstoreAddOutlined /> },
    // { name: "Reports", route: "/reports", icon: <PieChartOutlined /> },
    { name: "Profile", route: "/profile", icon: <UserOutlined /> },
    { label: "Forms" },
    {
      name: "Fortnightly Monitor",
      route: "/fortnightly-monitor",
      icon: <FormOutlined />,
    },
    {
      name: "Classroom Walkthrough",
      route: "/classroom-walkthrough",
      icon: <SignatureOutlined />,
    },
    {
      name: "Notebook Checking",
      route: "/notebook-checking-proforma",
      icon: <BookFilled />,
    },
    {
      name: "Learning Progress Checklist",
      route: "weekly4form",
      icon: <DatabaseFilled />,
    },
  ],
};

export const columnsCreate = [
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
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Link to={`${record._id}`}>
          <Tag color="#4f6f52" key={record._id}>
            Send Email
          </Tag>
        </Link>
      </Space>
    ),
  },
];

// export const Formcolumns1 = [
//   {
//     title: UserRole[2] === Role ? "Observer Name" : "Teacher Name",
//     dataIndex: "grenralDetails", // Corrected the typo from 'grenralDetails' to 'generalDetails'
//     key: "grenralDetails",
//     render: (text, record) => (
//       <a>
//         {UserRole[2] === Role ? record.createdBy.name : text.NameoftheVisitingTeacher.name}
//       </a>
//     )
//   },
//   {
//     title: "Class Name",
//     dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
//     key: "grenralDetails",
//     render: (text) => (
//       <span>{text?.className}</span>
//     ), // Formatting the date
//   },
//   {
//     title: "Section",
//     dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
//     key: "grenralDetails",
//     render: (text) => (
//       <span>{text?.Section}</span>
//     ), // Formatting the date
//   },
//   {
//     title: "Subject",
//     dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
//     key: "grenralDetails",
//     render: (text) => (
//       <span>{text?.Subject}</span>
//     ), // Formatting the date
//   },
//   {
//     title: "Observation Date",
//     dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
//     key: "grenralDetails",
//     render: (text) => (
//       <span>{getAllTimes(text?.DateOfObservation)?.formattedDate2}</span>
//     ), // Formatting the date
//   },
//   {
//     title: Role === UserRole[2] ? "Your Status" : "Teacher Status",
//     dataIndex: "isTeacherCompletes",
//     key: "isTeacherCompletes",
//     render: (text) => (
//       <Space size="middle">
//         {text ? (
//           <Tag color="green">COMPLETED</Tag>
//         ) : (
//           <Tag color="volcano">NOT COMPLETED</Tag>
//         )}
//       </Space>
//     ),
//   },
//   {
//     title: Role === UserRole[2] ? "Your Status" : "Observer Status",
//     dataIndex: "isObserverCompleted",
//     key: "isObserverCompleted",
//     render: (text) => (
//       <Space size="middle">
//         {text ? (
//           <Tag color="green">COMPLETED</Tag>
//         ) : (
//           <Tag color="volcano">NOT COMPLETED</Tag>
//         )}
//       </Space>
//     ),
//   },

//   {
//     title: "Action",
//     dataIndex: "action",
//     key: "action",
//     render: (_, record) => (
//       <Space size="middle">
//         {(Role === UserRole[2] || Role === UserRole[1]) &&
//           record?.isTeacherCompletes &&
//           record?.isObserverCompleted ? (
//           <>
//             <Link
//               // className="btn btn-primary"
//               to={`/classroom-walkthrough/report/${record._id}`}
//             >
//              <button
//           className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
//         >
//           View Report
//         </button>
//             </Link>
//             {Role === UserRole[1] &&
//               <Link
//                 className="btn btn-danger"
//                 to={`/classroom-walkthrough/edit/${record._id}`}
//               >
//                 Edit
//               </Link>
//             }

//           </>
//         ) : (
//           Role === UserRole[1] && (

//             <Reminder id={record?._id} type={'form2'}/>
//             // <Button size="large" className="btn-outline-primary">
//             //   Reminders
//             // </Button>
//           )
//         )}
//         {Role === UserRole[2] &&
//           ((!record?.isTeacherCompletes && record?.isObserverCompleted) ||
//             (!record?.isTeacherCompletes && !record?.isObserverCompleted)) && (
//             <Link
//               className="btn text-primary"
//               to={`/classroom-walkthrough/create/${record._id}`}
//             >
//               Continue Form
//             </Link>
//           )}
//         {/*       */}
//       </Space>
//     ),
//   },
// ];


export const Formcolumns1 = [
  {
    title: UserRole[2] === Role ? "Observer Name" : "Teacher Name",
    dataIndex: "grenralDetails",
    key: "grenralDetails",
    sorter: (a, b) => {
      const nameA = UserRole[2] === Role
        ? (a?.createdBy?.name || "").toLowerCase()
        : (a?.grenralDetails?.NameoftheVisitingTeacher?.name || "").toLowerCase();
      const nameB = UserRole[2] === Role
        ? (b?.createdBy?.name || "").toLowerCase()
        : (b?.grenralDetails?.NameoftheVisitingTeacher?.name || "").toLowerCase();

      return nameA.localeCompare(nameB);
    },
    render: (text, record) => (
      <a>
        {UserRole[2] === Role ? record.createdBy.name : text?.NameoftheVisitingTeacher?.name}
      </a>
    ),
  },
  {
    title: "Class Name",
    dataIndex: "grenralDetails",
    key: "className",
    sorter: (a, b) =>
      (a?.grenralDetails?.className || "").localeCompare(b?.grenralDetails?.className || ""),
    render: (text) => <span>{text?.className}</span>,
  },
  {
    title: "Section",
    dataIndex: "grenralDetails",
    key: "section",
    sorter: (a, b) =>
      (a?.grenralDetails?.Section || "").localeCompare(b?.grenralDetails?.Section || ""),
    render: (text) => <span>{text?.Section}</span>,
  },
  {
    title: "Subject",
    dataIndex: "grenralDetails",
    key: "subject",
    sorter: (a, b) =>
      (a?.grenralDetails?.Subject || "").localeCompare(b?.grenralDetails?.Subject || ""),
    render: (text) => <span>{text?.Subject}</span>,
  },
  {
    title: "Observation Date",
    dataIndex: "grenralDetails",
    key: "observationDate",
    sorter: (a, b) => new Date(a?.grenralDetails?.DateOfObservation) - new Date(b?.grenralDetails?.DateOfObservation),
    render: (text) => <span>{getAllTimes(text?.DateOfObservation)?.formattedDate2}</span>,
  },
  {
    title: Role === UserRole[2] ? "Your Status" : "Teacher Status",
    dataIndex: "isTeacherCompletes",
    key: "isTeacherCompletes",
    sorter: (a, b) => (a.isTeacherCompletes === b.isTeacherCompletes ? 0 : a.isTeacherCompletes ? -1 : 1),
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
    title: Role === UserRole[2] ? "Your Status" : "Observer Status",
    dataIndex: "isObserverCompleted",
    key: "isObserverCompleted",
    sorter: (a, b) => (a.isObserverCompleted === b.isObserverCompleted ? 0 : a.isObserverCompleted ? -1 : 1),
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
    render: (_, record) => (
      <Space size="middle">
        {(Role === UserRole[2] || Role === UserRole[1]) &&
          record?.isTeacherCompletes &&
          record?.isObserverCompleted ? (
          <>
            <Link to={`/classroom-walkthrough/report/${record._id}`}>
              <button className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors">
                View Report
              </button>
            </Link>
            {Role === UserRole[1] && (
              <Link to={`/classroom-walkthrough/edit/${record._id}`}>
                <button

                  className="text-nowrap px-3 py-1 bg-red-50 text-red-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              </Link>
            )}
          </>
        ) : (
          Role === UserRole[1] && <Reminder id={record?._id} type={'form2'} />
        )}
        {Role === UserRole[2] &&
          ((!record?.isTeacherCompletes && record?.isObserverCompleted) ||
            (!record?.isTeacherCompletes && !record?.isObserverCompleted)) && (
            <Link className="btn text-primary" to={`/classroom-walkthrough/create/${record._id}`}>
              Continue Form
            </Link>
          )}
      </Space>
    ),
  },
];


export const Formcolumns2 = [
  {
    title: "Title",
    dataIndex: `userId`, // Accessing the teacher's name
    key: `userId`,
    render: (text, key) =>
      text?.access === "Observer" && (
        <p className="mb-0 fw-light" key={key}>
          <span className="fw-bold">{text.name}</span> Invited you to Complete{" "}
          <br /> Fortnightly Monitor Form
        </p>
      ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Link
          className="btn btn-primary"
          to={`/fortnightly-monitor/create/${record._id}`}
        >
          Continue Form
        </Link>
      </Space>
    ),
  },
];

// export const Formcolumns3 = [
//   {
//     title: UserRole[1] === getUserId()?.access ? "Teacher Name" : "Observer Name",
//     dataIndex: `grenralDetails`, // Accessing the teacher's name
//     key: UserRole[1] === getUserId()?.access ? "Teaher" : "Observer",
//     render: (text, record) => <a>{UserRole[1] === getUserId()?.access ? record.createdBy?.name || record.teacherID?.name : text.NameofObserver.name}</a>,
//   },
//   {
//     title: "Grade",
//     dataIndex: `grenralDetails`, // Accessing the teacher's name
//     key: `className`,
//     render: (text, record) => <a>{text.className || "N/A"}</a>,
//   },
//   {
//     title: "Section",
//     dataIndex: `grenralDetails`, // Accessing the teacher's name
//     key: `Section`,
//     render: (text, record) => <a>{text.Section || "N/A"}</a>,
//   },
//   {
//     title: "Subject",
//     dataIndex: `grenralDetails`, // Accessing the teacher's name
//     key: `Subject`,
//     render: (text, record) => <a>{text.Subject || "N/A"}</a>,
//   },
//   {
//     title: "Observation Date",
//     dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
//     key: "DateOfObservation",
//     render: (text) => (
//       <span>{getAllTimes(text.DateOfObservation).formattedDate2 || "N/A"}</span>
//     ), // Formatting the date
//   },


//   {
//     title: "Teacher Status",
//     dataIndex: "isTeacherComplete",
//     key: "isTeacherComplete",
//     render: (text) => (
//       <Space size="middle">
//         {text ? (
//           <Tag color="green">COMPLETED</Tag>
//         ) : (
//           <Tag color="volcano">NOT COMPLETED</Tag>
//         )}
//       </Space>
//     ),
//   },
//   {
//     title: "Observer Status",
//     dataIndex: "isObserverComplete",
//     key: "isObserverComplete",
//     render: (text) => (
//       <Space size="middle">
//         {text ? (
//           <Tag color="green">COMPLETED</Tag>
//         ) : (
//           <Tag color="volcano">NOT COMPLETED</Tag>
//         )}
//       </Space>
//     ),
//   },
//   {
//     title: "Reflection Status",
//     dataIndex: "isReflation",
//     key: "isReflation",
//     render: (text) => (
//       <Space size="middle">
//         {text ? (
//           <Tag color="green">COMPLETED</Tag>
//         ) : (
//           <Tag color="volcano">NOT COMPLETED</Tag>
//         )}
//       </Space>
//     ),
//   },
//   {
//     title: "Action",
//     dataIndex: "action",
//     key: "action",
//     render: (_, record) => (
//       <Space size="middle">
//         {(Role === UserRole[1] || Role === UserRole[2]) &&
//           record?.isTeacherComplete &&
//           record?.isObserverComplete &&
//           record?.isReflation &&
//           (
//             <>
//               <Link
//                 className="btn btn-primary"
//                 to={`/notebook-checking-proforma/report/${record?._id}`}
//               >
//                 View Report
//               </Link>
//               <Link
//                 className="btn btn-danger"
//                 to={`/notebook-checking-proforma/edit/${record?._id}`}
//               >
//                 Edit
//               </Link>
//             </>
//           )}
//         {Role === UserRole[2] &&
//           (record?.isTeacherComplete &&
//           record?.isObserverComplete &&
//           !record?.isReflation ) && (
//             <Link
//               className="btn text-primary"
//               to={`/notebook-checking-proforma/complete/${record._id}`}>
//               Continue Form
//             </Link>
//           )}
//             {Role === UserRole[1] &&
//           (record?.isTeacherComplete &&
//           record?.isObserverComplete &&
//           !record?.isReflation ) && (
//             <Button size="large" className="btn-outline-primary">
//             Reminders
//           </Button>
//           )}

//         {Role === UserRole[2] && (
//           !record?.isTeacherComplete && !record?.isObserverComplete &&
//           <Link
//             className="btn text-primary"
//             to={`/notebook-checking-proforma/edit/${record._id}`} >
//             Continue Form
//           </Link>
//         )}
//         {Role === UserRole[2] && (
//           record?.isTeacherComplete && !record?.isObserverComplete &&
//           <Button size="large" className="btn-outline-primary">
//             Reminders
//           </Button>
//         )}

//         {Role === UserRole[1] && (
//           record?.isTeacherComplete && !record?.isObserverComplete &&
//           <Link
//             className="btn text-primary"
//             to={`/notebook-checking-proforma/create/${record._id} `} >
//             Continue Form
//           </Link>
//         )}

//         {Role === UserRole[1] && (
//           (!record?.isTeacherComplete && !record?.isObserverComplete) &&
//           <Button size="large" className="btn-outline-primary">
//             Reminders
//           </Button>
//         )}

//         {Role === UserRole[1] && (
//           (!record?.isTeacherComplete && record?.isObserverComplete) &&
//           <Button size="large" className="btn-outline-primary">
//             Reminders
//           </Button>
//         )}

//         {/* {(Role === UserRole[1] || Role === UserRole[2]) &&
//         record?.isTeacherComplete &&
//         record?.isObserverComplete ? (
//           <>
//           <Link
//             className="btn btn-primary"
//             to={`/notebook-checking-proforma/report/${record._id}`}
//           >
//             View Report
//           </Link>
//           <Link
//           className="btn btn-danger"
//           to={`/notebook-checking-proforma/edit/${record._id}`} >
//          Edit
//         </Link>
//           </>
//         ) : (
//           Role === UserRole[2] && (
//             !record?.isTeacherComplete && !record?.isObserverComplete ? 
//             <Link
//             className="btn text-primary"
//             to={`/notebook-checking-proforma/edit/${record._id}`} >
//             Continue Form
//           </Link>
//             :
//             <Button size="large" className="btn-outline-primary">
//             Reminders
//           </Button>
//           )
//         )}
//         {Role === UserRole[1] &&
//           ((record?.isTeacherComplete && !record?.isObserverComplete) ||
//             (!record?.isTeacherComplete && !record?.isObserverComplete)) && (
//             <Link
//               className="btn text-primary"
//               to={`/notebook-checking-proforma/create/${record._id}`}
//             >
//               Continue Form
//             </Link>
//           )} */}

//       </Space>
//     ),
//   },
// ];

export const Formcolumns3 = [
  {
    title: UserRole[1] === getUserId()?.access ? "Teacher Name" : "Observer Name",
    dataIndex: "grenralDetails",
    key: UserRole[1] === getUserId()?.access ? "Teacher" : "Observer",
    width: '160px',
    sorter: (a, b) =>
      (a.createdBy?.name || a.teacherID?.name || "").localeCompare(
        b.createdBy?.name || b.teacherID?.name || ""
      ),
    render: (text, record) => (
      <a>
        {UserRole[1] === getUserId()?.access
          ? record.createdBy?.name || record.teacherID?.name
          : text.NameofObserver.name}
      </a>
    ),
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
    render: (date) => <span>{date ? getAllTimes(date?.DateOfObservation).formattedDate2 : "N/A"}</span>,
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
    render: (_, record) => (
      <Space size="middle">
        {(Role === UserRole[1] || Role === UserRole[2]) &&
          record?.isTeacherComplete &&
          record?.isObserverComplete &&
          record?.isReflation && (
            <>
              <Link to={`/notebook-checking-proforma/report/${record?._id}`}>
                <button
                  className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
                >
                  View Report
                </button>
              </Link>
              <Link to={`/notebook-checking-proforma/edit/${record?._id}`}>
                <button

                  className="text-nowrap px-3 py-1 bg-red-50 text-red-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              </Link>
            </>
          )}
        {Role === UserRole[2] && record?.isTeacherComplete && record?.isObserverComplete && !record?.isReflation && (
          <Link to={`/notebook-checking-proforma/complete/${record._id}`}>
            <button

              className="text-nowrap px-3 py-1  text-blue-600  rounded-md text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </Link>
        )}
        {Role === UserRole[1] && record?.isTeacherComplete && record?.isObserverComplete && !record?.isReflation && (
          <Reminder id={record?._id} type={'form3'} />
        )}
        {Role === UserRole[2] && !record?.isTeacherComplete && !record?.isObserverComplete && (
          <Link to={`/notebook-checking-proforma/edit/${record._id}`}>
            <button

              className="text-nowrap px-3 py-1  text-blue-600  rounded-md text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </Link>
        )}
        {Role === UserRole[2] && record?.isTeacherComplete && !record?.isObserverComplete && (
          <Reminder id={record?._id} type={'form3'} />
        )}
        {Role === UserRole[1] && record?.isTeacherComplete && !record?.isObserverComplete && (
          <Link to={`/notebook-checking-proforma/create/${record._id}`}>
            <button

              className="text-nowrap px-3 py-1  text-blue-600  rounded-md text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </Link>
        )}
        {Role === UserRole[1] && !record?.isTeacherComplete && !record?.isObserverComplete && (
          <Button size="large" className="btn-outline-primary">Reminders</Button>
        )}
        {Role === UserRole[1] && !record?.isTeacherComplete && record?.isObserverComplete && (
          <Reminder id={record?._id} type={'form3'} />
        )}
      </Space>
    ),
    width: '160px',
  },
];



export const FormcolumnsForm1 = [
  // {
  //   title: UserRole[1] === Role ? "Teacher Name" : "Observer Name",
  //   dataIndex: "teacherID",
  //   key: "teacherID",
  //   width:"160px",
  //   render: (text, record) => (
  //     <a>
  //       {UserRole[1] === Role
  //         ? record?.teacherID?.name || record?.userId?.name
  //         : record?.coordinatorID?.name || record?.userId?.name}
  //     </a>
  //   ),
  // },
  {
    title: UserRole[1] === Role ? "Teacher Name" : "Observer Name",
    dataIndex: UserRole[1] === Role ? "teacherID" : "coordinatorID",
    key: UserRole[1] === Role ? "teacherID" : "coordinatorID",
    width: "160px",
    sorter: (a, b) => (a?.name || b?.userId?.name).localeCompare(UserRole[1] === Role ? b.teacherID?.name : b.coordinatorID?.name || b?.userId?.name),
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
    render: (date) => <span>{date ? getAllTimes(date).formattedDate2 : "N/A"}</span>,
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
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "160px",
    render: (_, record) => {
      const { isTeacherComplete, isCoordinatorComplete, isObserverInitiation } =
        record;
      const currentUserRole = getUserId()?.access;

      if (isTeacherComplete && isCoordinatorComplete) {
        return (
          <div className="d-flex gap-1 justify-content-start align-items-center">
            <Link
              // className="btn btn-primary text-nowrap h-fit"
              to={`/fortnightly-monitor/report/${record._id}`}
            >
              <button
                className="text-nowrap px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
              >
                View Report
              </button>
            </Link>
            <Link
              to={`/fortnightly-monitor/edit/${record._id}`}
            >
              <button

                className="text-nowrap px-3 py-1 bg-red-50 text-red-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
              >
                Edit
              </button>

            </Link>
          </div>
        );
      }

      if (
        currentUserRole === UserRole[1] &&
        !isTeacherComplete &&
        !isCoordinatorComplete &&
        !isObserverInitiation
      ) {

        return (
          <Reminder id={record?._id} />
        );
      }

      if (
        currentUserRole === UserRole[2] &&
        !isTeacherComplete &&
        !isCoordinatorComplete &&
        isObserverInitiation
      ) {
        return (
          <Link
            // className="btn text-primary"
            to={`/fortnightly-monitor/create/${record._id}`}
          >
            <button
              className="text-nowrap px-3 py-1  text-blue-600 hover:text-blue-900 rounded-md text-sm font-medium transition-colors"
            >
              Continue Form
            </button>

          </Link>
        );
      }

      if (
        currentUserRole === UserRole[2] &&
        isTeacherComplete &&
        !isCoordinatorComplete
      ) {

        return (
          <div className="d-flex gap-1 justify-content-start align-items-center">

            <Reminder id={record?._id} />
            <Link
              className="btn text-primary text-nowrap"
              to={`/fortnightly-monitor/edit/${record._id}`}
            >
              <Button size="large" color="danger" variant="solid">
                Edit
              </Button>
            </Link>
          </div>
        );
      }

      if (
        (currentUserRole === UserRole[1] &&
          !isTeacherComplete &&
          !isCoordinatorComplete &&
          isObserverInitiation) ||
        (currentUserRole === UserRole[1] &&
          !isTeacherComplete &&
          isCoordinatorComplete)
      ) {

        return (
          <Reminder id={record?._id} />
        );
      }

      if (
        currentUserRole === UserRole[1] &&
        isTeacherComplete &&
        !isCoordinatorComplete
      ) {
        return (
          <Link
            // className="btn text-primary"
            to={`/fortnightly-monitor/create/${record._id}`}
          >
            <button
              className="text-nowrap px-3 py-1  text-blue-600 hover:text-blue-900 rounded-md text-sm font-medium transition-colors"
            >
              Continue Form
            </button>
          </Link>
        );
      }

      return null;
    },
  },
];




export const AdminFormcolumnsForm1 = [
  {
    title: UserRole[1] === Role ? "Teacher Name" : "Observer Name",
    dataIndex: "teacherID",
    key: "teacherID",
    render: (text, record) => (
      <a>
        {UserRole[1] === Role
          ? record?.teacherID?.name || record?.userId?.name
          : record?.coordinatorID?.name || record?.userId?.name}
      </a>
    ),
  },
  {
    title: "Class Name",
    dataIndex: "className",
    key: "className",
    render: (text) => <a>{text || "N/A"}</a>,
  },
  {
    title: "Section",
    dataIndex: "section",
    key: "section",
    render: (text) => <a>{text || "N/A"}</a>,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text) => <a>{getAllTimes(text).formattedDate2 || "N/A"}</a>,
  },
  {
    title: "Teacher Status",
    dataIndex: "isTeacherComplete",
    key: "isTeacherComplete",
    render: (text) => (
      <Space size="middle">
        <Tag color={text ? "green" : "volcano"}>
          {text ? "COMPLETED" : "NOT COMPLETED"}
        </Tag>
      </Space>
    ),
  },
  {
    title: "Observer Status",
    dataIndex: "isCoordinatorComplete",
    key: "isCoordinatorComplete",
    render: (text) => (
      <Space size="middle">
        <Tag color={text ? "green" : "volcano"}>
          {text ? "COMPLETED" : "NOT COMPLETED"}
        </Tag>
      </Space>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => {
      const { isTeacherComplete, isCoordinatorComplete, isObserverInitiation } =
        record;
      const currentUserRole = getUserId()?.access;

      if (isTeacherComplete && isCoordinatorComplete) {
        return (
          <>
            <Link
              className="btn btn-primary"
              to={`/fortnightly-monitor/report/${record._id}`}
            >
              View Report
            </Link>
          </>
        );
      }

      if (
        currentUserRole === UserRole[1] &&
        !isTeacherComplete &&
        !isCoordinatorComplete &&
        !isObserverInitiation
      ) {
        return (
          <Button size="large" className="btn-outline-primary">
            Reminders
          </Button>
        );
      }

      if (
        currentUserRole === UserRole[2] &&
        !isTeacherComplete &&
        !isCoordinatorComplete &&
        isObserverInitiation
      ) {
        return (
          <Link
            className="btn text-primary"
            to={`/fortnightly-monitor/create/${record._id}`}
          >
            Continue Form
          </Link>
        );
      }

      if (
        currentUserRole === UserRole[2] &&
        isTeacherComplete &&
        !isCoordinatorComplete
      ) {
        return (
          <>
            <Button
              size="large"
              variant="solid"
              color="primary"
              className="me-2"
            >
              Reminders
            </Button>
            <Link
              className="btn text-primary"
              to={`/fortnightly-monitor/edit/${record._id}`}
            >
              <Button size="large" color="danger" variant="solid">
                Edit
              </Button>
            </Link>
          </>
        );
      }

      if (
        (currentUserRole === UserRole[1] &&
          !isTeacherComplete &&
          !isCoordinatorComplete &&
          isObserverInitiation) ||
        (currentUserRole === UserRole[1] &&
          !isTeacherComplete &&
          isCoordinatorComplete)
      ) {
        return (
          <Button size="large" className="btn-outline-primary">
            Reminders
          </Button>
        );
      }

      if (
        currentUserRole === UserRole[1] &&
        isTeacherComplete &&
        !isCoordinatorComplete
      ) {
        return (
          <Link
            className="btn text-primary"
            to={`/fortnightly-monitor/create/${record._id}`}
          >
            Continue Form
          </Link>
        );
      }

      return null;
    },
  },
];


export const AdminFormcolumns1 = [
  {
    title: UserRole[2] === Role ? "Observer Name" : "Teacher Name",
    dataIndex: "grenralDetails", // Corrected the typo from 'grenralDetails' to 'generalDetails'
    key: "grenralDetails",
    render: (text, record) => (
      <a>
        {text.NameoftheVisitingTeacher.name}
      </a>
    )
  },
  {
    title: "Grade",
    dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
    key: "grenralDetails",
    render: (text) => (
      <span>{text?.className}</span>
    ), // Formatting the date
  },
  {
    title: "Section",
    dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
    key: "grenralDetails",
    render: (text) => (
      <span>{text?.Section}</span>
    ), // Formatting the date
  },
  {
    title: "Subject",
    dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
    key: "grenralDetails",
    render: (text) => (
      <span>{text?.Subject}</span>
    ), // Formatting the date
  },
  {
    title: "Observation Date",
    dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
    key: "grenralDetails",
    render: (text) => (
      <span>{getAllTimes(text?.DateOfObservation)?.formattedDate2}</span>
    ), // Formatting the date
  },
  {
    title: "Teacher Status",
    dataIndex: "isTeacherCompletes",
    key: "isTeacherCompletes",
    render: (text) => (
      <Space size="middle">
        {text ? (
          <Tag color="green">COMPLETED</Tag>
        ) : (
          <Tag color="volcano">NOT COMPLETED</Tag>
        )}
      </Space>
    ),
  },
  {
    title: "Observer Status",
    dataIndex: "isObserverCompleted",
    key: "isObserverCompleted",
    render: (text) => (
      <Space size="middle">
        {text ? (
          <Tag color="green">COMPLETED</Tag>
        ) : (
          <Tag color="volcano">NOT COMPLETED</Tag>
        )}
      </Space>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        {
          (record?.isTeacherCompletes &&
            record?.isObserverCompleted) && (
            <>
              <Link
                className="btn btn-primary"
                to={`/classroom-walkthrough/report/${record._id}`}
              >
                View Report
              </Link>
            </>
          )}

      </Space>
    ),
  },
];


export const AdminFormcolumns3 = [
  {
    title: "Observer Name",
    dataIndex: `grenralDetails`, // Accessing the teacher's name
    key: "Observer",
    render: (text, record) => <a>{record.createdBy?.name || text.NameofObserver.name}</a>,
  },
  {
    title: "Grade",
    dataIndex: `grenralDetails`, // Accessing the teacher's name
    key: `className`,
    render: (text, record) => <a>{text.className || "N/A"}</a>,
  },
  {
    title: "Section",
    dataIndex: `grenralDetails`, // Accessing the teacher's name
    key: `Section`,
    render: (text, record) => <a>{text.Section || "N/A"}</a>,
  },
  {
    title: "Subject",
    dataIndex: `grenralDetails`, // Accessing the teacher's name
    key: `Subject`,
    render: (text, record) => <a>{text.Subject || "N/A"}</a>,
  },
  {
    title: "Observation Date",
    dataIndex: "grenralDetails", // Correctly accessing the DateOfObservation
    key: "DateOfObservation",
    render: (text) => (
      <span>{getAllTimes(text.DateOfObservation).formattedDate2 || "N/A"}</span>
    ), // Formatting the date
  },
  {
    title: "Observer Status",
    dataIndex: "isObserverComplete",
    key: "isObserverComplete",
    render: (text) => (
      <Space size="middle">
        {text ? (
          <Tag color="green">COMPLETED</Tag>
        ) : (
          <Tag color="volcano">NOT COMPLETED</Tag>
        )}
      </Space>
    ),
  },
  {
    title: "Teacher Status",
    dataIndex: "isTeacherComplete",
    key: "isTeacherComplete",
    render: (text) => (
      <Space size="middle">
        {text ? (
          <Tag color="green">COMPLETED</Tag>
        ) : (
          <Tag color="volcano">NOT COMPLETED</Tag>
        )}
      </Space>
    ),
  },

  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        {(record?.isTeacherComplete &&
          record?.isObserverComplete) && (
            <>
              <Link
                className="btn btn-primary"
                to={`/notebook-checking-proforma/report/${record?._id}`}
              >
                View Report
              </Link>
            </>
          )}

      </Space>
    ),
  },
];