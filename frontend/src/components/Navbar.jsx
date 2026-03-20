import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Notifications from "./Notifications.jsx";

export default function Navbar() {
  const { token, role, name, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="nav-brand">
        <Link to="/">Placement Tracker</Link>
      </div>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        {token && role === "STUDENT" && <NavLink to="/student">Dashboard</NavLink>}
        {token && role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
        {token && <NavLink to="/jobs">Jobs</NavLink>}
        {token && role === "STUDENT" && <NavLink to="/status">Status</NavLink>}
      </nav>
      <div className="nav-actions">
        {token ? (
          <>
            <span className="nav-user">{name}</span>
            {role === "STUDENT" && <Notifications />}
            <button className="btn ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">
              Login
            </Link>
            <Link className="btn" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
