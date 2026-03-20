import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function Header() {
  const { token, role } = useAuth();
  const dashboardLink = role === "ADMIN" ? "/admin" : "/student";

  return (
    <header className="app-header">
      <div className="header-brand">Placement Tracker</div>
      <nav className="header-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        {token && <NavLink to={dashboardLink}>Dashboard</NavLink>}
      </nav>
      <div className="header-logo-slot">
        <img className="header-logo" src={logo} alt="AVVJT Tech Solutions" />
      </div>
    </header>
  );
}
