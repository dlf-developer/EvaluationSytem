import { Navigate } from "react-router-dom";
import { getToken, getUserId } from "./auth";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import DashboardLayout from "./DashboardLayout";
import LoginLayout from "./LoginLayout";
import ObserverLayout from "./ObserverLayout";
import TeacherLayout from "./TeacherLayout";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import ObserverDashboard from "../Pages/Observer/ObserverDashboard";
import TeacherDashboard from "../Pages/Teachers/TeacherDashboard";
import Users from "../Pages/Admin/Users";
import NotFound404 from "../Components/NotFound404";
import UnderConstraction from "../Components/UnderConstraction";
import UserDetails from "../Pages/Admin/UserDetails";
import UserProfile from "../Pages/UserProfile";
import FortnightlyMonitor from "../Pages/Forms/FortnightlyMonitor";
import BasicDetailsForm from "../Components/BasicDeatilsForm";
import Details from "../Pages/Forms/FormInside/Details";
import ClassroomWalkthrough from "../Pages/Forms/ClassroomWalkthrough";
import DetailsWalkthrough from "../Pages/Forms/FormInside/DetailsWalkthrough";
import Notebook from "../Pages/Forms/Notebook";
import NoteBookDetails from "../Pages/Forms/FormInside/NoteBookDetails";
import TeacherWalkthrough from "../Pages/Forms/FormInside/TeacherWalkthrough";
import ObserverNotebook from "../Pages/Forms/FormInside/ObserverNotebook";
import Reader from "../Pages/Reports/Reader";
import FinalReport from "../Pages/Observer/FinalFom/FinalReport";
import WingCoordinator from "../Pages/Forms/WingCoordinator";
import ClassroomWalkthroughReader from "../Pages/Reports/ClassroomWalkthroughReader";
import FortnightlyMonitorInitiation from "../Pages/Observer/FinalFom/FortnightlyMonitorInitiation";
import InitiateBasicDetails from "../Components/InitiateBasicDetails";
import FortnightlyMonitorEdit from "../Pages/Teachers/FortnightlyMonitorEdit";
import OB_FortnightlyMonitorEdit from "../Pages/Observer/OB_FortnightlyMonitorEdit";
import OB_WalkthroughEdit from "../Pages/Observer/OB_WalkthroughEdit";
import OB_Notebook from "../Pages/Observer/OB_Notebook";
import TC_Notebook from "../Pages/Teachers/TC_Notebook";
import NotebookPDF from "../Pages/Reports/NotebookPDF";
import ClassSectionPage from "../Pages/Admin/ClassSectionPage";
import Weely4Page from "../Pages/Observer/Weely4Page";
import Weely4Form from "../Pages/Forms/Weely4Form";
import NoteBookInisiate from "../Pages/Observer/NoteBookInisiate";
import Weekly4FormReport from "../Pages/Reports/Weekly4FormReport";
import Fortnightly from "../Pages/Admin/Fortnightly";
import ClassRoom from "../Pages/Admin/ClassRoom";
import NoteBook from "../Pages/Admin/NootBook";
import Weekly from "../Pages/Admin/Weekly";
import NotebookComplete from "../Pages/Teachers/NotebookComplete";
import TextBox from "../Pages/TextBox";
import AdminReport from "../Pages/Admin/AdminReport";
import ObserverReports from "../Pages/Observer/ObserverReports"
import OB_Wing from "../Pages/Observer/Form/wing-coordinator/OB_Wing";

const role = getUserId()?.access;
const isLoggedIn = getToken() !== null ? getToken() : null;
const protects = {
  Teacher: [
    {
      path: "/",
      element: isLoggedIn && role === 'Teacher' ? <TeacherLayout /> : <Navigate to="/login" />,
      children: [
        { path: "/", element: <Navigate to="/dashboard" /> },
        { path: "/dashboard", element: <TeacherDashboard /> },
        { path: "/profile", element: <UserProfile /> },
        { path: '/fortnightly-monitor', element: <FortnightlyMonitor /> },
        { path: '/fortnightly-monitor/create', element: <BasicDetailsForm /> },
        { path: '/fortnightly-monitor/create/:id', element: <Details /> },
        { path: '/fortnightly-monitor/initiate/create/:id', element: <Details /> },
        { path: '/fortnightly-monitor/report/:id', element: <Reader /> },
        { path: "/classroom-walkthrough", element: <ClassroomWalkthrough /> },
        { path: "/classroom-walkthrough/create/:id", element: <TeacherWalkthrough /> },
        { path: "/classroom-walkthrough/report/:id", element: <ClassroomWalkthroughReader /> },
        { path: '/notebook-checking-proforma', element: <Notebook /> },
        { path: '/notebook-checking-proforma/create', element: <NoteBookDetails /> },
        { path: '/notebook-checking-proforma/create/:id', element: <NoteBookDetails /> },
        { path: '/fortnightly-monitor/edit/:id', element: <FortnightlyMonitorEdit /> },
        // {path:"/classroom-walkthrough/edit/:id",element:<OB_WalkthroughEdit/>},
        { path: "/notebook-checking-proforma/edit/:id", element: <TC_Notebook /> },
        { path: "/notebook-checking-proforma/report/:id", element: <NotebookPDF /> },
        { path: "/weekly4form", element: <Weely4Page /> },
        { path: "/weekly4form/create", element: <Weely4Form /> },
        { path: "/weekly4form/create/:id", element: <Weely4Form /> },
        { path: "/weekly4form/report/:id", element: <Weekly4FormReport /> },
        { path: "/notebook-checking-proforma/complete/:id" , element: <NotebookComplete />},
        { path: "*", element: <NotFound404 /> },
      ],
    },
  ],
  Superadmin: [
    {
      path: "/",
      element: isLoggedIn && role === 'Superadmin' ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        { path: "/", element: <Navigate to="/dashboard" /> },
        { path: "/dashboard", element: <AdminDashboard /> },
        { path: "/users", element: <Users /> },
        { path: "/users/:id", element: <UserDetails /> },
        { path: "/reports", element: <AdminReport /> },
        { path: "/profile", element: <UserProfile /> },
        { path: '/fortnightly-monitor', element: <Fortnightly /> },
        { path: '/fortnightly-monitor/report/:id', element: <Reader /> },
        { path: "/classroom-walkthrough", element: <ClassRoom /> },
        { path: "/classroom-walkthrough/report/:id", element: <ClassroomWalkthroughReader /> },
        { path: "/notebook-checking-proforma", element: <NoteBook /> },
        { path: "/notebook-checking-proforma/report/:id", element: <NotebookPDF /> },
        { path: "/weekly4form", element: <Weekly /> },
        { path: "/weekly4form/report/:id", element: <Weekly4FormReport /> },
        { path: "/class-section", element: <ClassSectionPage/> },
        { path: "*", element: <NotFound404 /> },
      ],
    },
  ],
  Observer: [
    {
      path: "/",
      element: isLoggedIn && role === 'Observer' ? <ObserverLayout /> : <Navigate to="/login" />,
      children: [
        { path: "/", element: <Navigate to="/dashboard" /> },
        { path: "/dashboard", element: <ObserverDashboard /> },
        { path: "/reports", element: <ObserverReports /> },
        { path: '/fortnightly-monitor', element: <FortnightlyMonitor /> },
        { path: "/profile", element: <UserProfile /> },
        { path: '/fortnightly-monitor', element: <FortnightlyMonitor /> },
        { path: '/fortnightly-monitor/create', element: <BasicDetailsForm /> },
        { path: '/fortnightly-monitor/initiate/create/:id', element: <Details /> },
        { path: '/fortnightly-monitor/create/:id', element: <Details /> },
        { path: '/fortnightly-monitor/report/:id', element: <Reader /> },
        { path: "/classroom-walkthrough", element: <ClassroomWalkthrough /> },
        { path: "/classroom-walkthrough/create", element: <DetailsWalkthrough /> },
        { path: "/classroom-walkthrough/create/:id", element: <DetailsWalkthrough /> },
        { path: "/classroom-walkthrough/report/:id", element: <ClassroomWalkthroughReader /> },
        { path: '/notebook-checking-proforma', element: <Notebook /> },
        { path: '/notebook-checking-proforma/create/:id', element: <ObserverNotebook /> },
        { path: "/fortnightly-monitor/form-initiation", element: <FortnightlyMonitorInitiation /> },
        { path: '/fortnightly-monitor/edit/:id', element: <FortnightlyMonitorEdit /> },
        { path: "/classroom-walkthrough/edit/:id", element: <OB_WalkthroughEdit /> },
        { path: "/notebook-checking-proforma/edit/:id", element: <OB_Notebook /> },
        { path: "/notebook-checking-proforma/form-initiation", element: <NoteBookInisiate /> },
        { path: "/notebook-checking-proforma/report/:id", element: <NotebookPDF /> },
        { path: "/weekly4form", element: <Weely4Page /> },
        { path: "/weekly4form/create", element: <Weely4Form /> },
        { path: "/weekly4form/edit/:id", element: <Weely4Form /> },
        { path: "/weekly4form/report/:id", element: <Weekly4FormReport /> },
        {path:"/wing-coordinator",element:<WingCoordinator/>},
        {path:"/wing-coordinator/:id",element:<OB_Wing/>},
        { path: "*", element: <NotFound404 /> },

      ],
    },
  ],
  default: [
    {
      path: "/",
      element: !isLoggedIn ? <LoginLayout /> : <Navigate to="/dashboard" />,
      children: [
        { path: "/", element: <Login /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Register /> },
        { path: "/test", element: <TextBox /> },
        { path: "*", element: <NotFound404 /> },
      ],
    },
  ],
};

export const protect = role && isLoggedIn ? protects[role] : protects['default'];
export const defaultProtect = protects['default'];
