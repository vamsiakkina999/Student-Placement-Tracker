import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const { role, name, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = (nameValue) => {
    if (!nameValue) return "U";
    const parts = nameValue.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameValue.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="user-avatar" aria-hidden="true">
          {initials(name)}
        </div>
        <div>
          <div className="user-name">{name || "User"}</div>
          <div className="user-role">{role === "ADMIN" ? "Administrator" : "Student"}</div>
        </div>
      </div>

      {role === "STUDENT" ? (
        <div className="sidebar-section">
          <div className="sidebar-title">Student</div>
          <NavLink to="/student/apply">Apply Jobs</NavLink>
          <NavLink to="/student/profile">Profile</NavLink>
          <NavLink to="/student/eligibility">Eligibility</NavLink>
          <NavLink to="/status">Applied Jobs</NavLink>
          <NavLink to="/student/selected">Selected</NavLink>
        </div>
      ) : (
        <div className="sidebar-section">
          <div className="sidebar-title">Admin</div>
          <NavLink to="/admin/drives">Drives</NavLink>
          <NavLink to="/admin/companies">Companies</NavLink>
          <NavLink to="/admin/applications">Applications</NavLink>
          <NavLink to="/admin/shortlisted">Shortlisted</NavLink>
          <NavLink to="/admin/selected">Selected</NavLink>
          <NavLink to="/admin/students">Students</NavLink>
        </div>
      )}

      <div className="sidebar-footer">
        <button className="btn ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
