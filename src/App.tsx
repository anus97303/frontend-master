import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Calendar from "./pages/Calendar";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import EcommerceHome from "./pages/Dashboard/Ecommerce";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/OtherPage/Blank";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";

// School Management Pages
import SchoolDashboard from "./pages/School/SchoolDashboard";
import StudentList from "./pages/School/Students/StudentList";
import StudentProfile from "./pages/School/Students/StudentProfile";
import TeacherList from "./pages/School/Teachers/TeacherList";
import ClassList from "./pages/School/Classes/ClassList";
import AttendanceManage from "./pages/School/Attendance/AttendanceManage";
import ExamList from "./pages/School/Exams/ExamList";
import FeeManage from "./pages/School/Fees/FeeManage";
import NoticeList from "./pages/School/Notices/NoticeList";
import SchoolSettings from "./pages/School/Settings/SchoolSettings";
import ManageRegistration from "./pages/School/Registration/ManageRegistration";
import StudentEvaluations from "./pages/School/Admissions/StudentEvaluations";
import TeacherRecruitment from "./pages/School/Teachers/TeacherRecruitment";
import CollectFees from "./pages/School/Fees/CollectFees";
import DefaulterList from "./pages/School/Fees/DefaulterList";
import RollNumberSlips from "./pages/School/Exams/RollNumberSlips";
import TransferCertificate from "./pages/School/Students/TransferCertificate";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Primary School Management Routes (Protected) */}
            <Route index path="/" element={<ProtectedRoute><SchoolDashboard /></ProtectedRoute>} />
            <Route path="/school" element={<ProtectedRoute><SchoolDashboard /></ProtectedRoute>} />
            <Route path="/school/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/school/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
            <Route
              path="/school/teachers"
              element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><TeacherList /></ProtectedRoute>}
            />
            <Route path="/school/classes" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route
              path="/school/attendance"
              element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AttendanceManage /></ProtectedRoute>}
            />
            <Route path="/school/exams" element={<ProtectedRoute><ExamList /></ProtectedRoute>} />
            <Route path="/school/fees" element={<ProtectedRoute><FeeManage /></ProtectedRoute>} />
            <Route path="/school/notices" element={<ProtectedRoute><NoticeList /></ProtectedRoute>} />
            <Route path="/school/settings" element={<ProtectedRoute><SchoolSettings /></ProtectedRoute>} />
            <Route path="/school/registration" element={<ProtectedRoute><ManageRegistration /></ProtectedRoute>} />
            <Route path="/school/admissions/evaluations" element={<ProtectedRoute><StudentEvaluations /></ProtectedRoute>} />
            <Route path="/school/teachers/recruitment" element={<ProtectedRoute allowedRoles={['admin']}><TeacherRecruitment /></ProtectedRoute>} />
            <Route path="/school/fees/collect" element={<ProtectedRoute><CollectFees /></ProtectedRoute>} />
            <Route path="/school/fees/defaulters" element={<ProtectedRoute><DefaulterList /></ProtectedRoute>} />
            <Route path="/school/exams/roll-numbers" element={<ProtectedRoute><RollNumberSlips /></ProtectedRoute>} />
            <Route path="/school/students/transfer-certificate" element={<ProtectedRoute><TransferCertificate /></ProtectedRoute>} />

            {/* Template Pages */}
            <Route path="/ecommerce" element={<EcommerceHome />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Standalone Auth Pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
