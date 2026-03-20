import { createContext, useContext, useMemo, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [role, setRole] = useState(
    (sessionStorage.getItem("role") || "").toUpperCase()
  );
  const [name, setName] = useState(sessionStorage.getItem("name"));

  const login = async (email, password, endpoint = "/auth/login") => {
    const { data } = await api.post(endpoint, { email, password });
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("name", data.name);
    setToken(data.token);
    setRole((data.role || "").toUpperCase());
    setName(data.name);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("name");
    setToken(null);
    setRole(null);
    setName(null);
  };

  const value = useMemo(
    () => ({ token, role, name, login, logout }),
    [token, role, name]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
