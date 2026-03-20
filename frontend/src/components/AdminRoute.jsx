import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (role !== "ADMIN") return <Navigate to="/student" />;
  return children;
}
