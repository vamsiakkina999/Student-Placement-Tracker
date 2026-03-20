import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function StudentRoute({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (role !== "STUDENT") return <Navigate to="/admin" />;
  return children;
}
