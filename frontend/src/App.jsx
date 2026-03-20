import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import Eligibility from "./pages/Eligibility.jsx";
import SelectedJobs from "./pages/SelectedJobs.jsx";
import ApplyJobs from "./pages/ApplyJobs.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCompanies from "./pages/AdminCompanies.jsx";
import AdminDrives from "./pages/AdminDrives.jsx";
import AdminApplications from "./pages/AdminApplications.jsx";
import AdminStudents from "./pages/AdminStudents.jsx";
import AdminSelected from "./pages/AdminSelected.jsx";
import AdminShortlisted from "./pages/AdminShortlisted.jsx";
import JobListings from "./pages/JobListings.jsx";
import ApplicationStatus from "./pages/ApplicationStatus.jsx";
import StudentRoute from "./components/StudentRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { token } = useAuth();

  return (
    <div className="app-shell">
      <Header />
      <div className={`app-body ${token ? "with-sidebar" : ""}`}>
        {token && <Sidebar />}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/student"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/apply"
              element={
                <StudentRoute>
                  <ApplyJobs />
                </StudentRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <StudentRoute>
                  <StudentProfile />
                </StudentRoute>
              }
            />
            <Route
              path="/student/eligibility"
              element={
                <StudentRoute>
                  <Eligibility />
                </StudentRoute>
              }
            />
            <Route
              path="/student/selected"
              element={
                <StudentRoute>
                  <SelectedJobs />
                </StudentRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <AdminRoute>
                  <AdminCompanies />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/drives"
              element={
                <AdminRoute>
                  <AdminDrives />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <AdminRoute>
                  <AdminApplications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/selected"
              element={
                <AdminRoute>
                  <AdminSelected />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/shortlisted"
              element={
                <AdminRoute>
                  <AdminShortlisted />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminRoute>
                  <AdminStudents />
                </AdminRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <StudentRoute>
                  <ApplyJobs />
                </StudentRoute>
              }
            />
            <Route
              path="/status"
              element={
                <StudentRoute>
                  <ApplicationStatus />
                </StudentRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
