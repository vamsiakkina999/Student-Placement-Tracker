import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(role === "ADMIN" ? "/admin" : "/student");
    }
  }, [token, role, navigate]);

  const getErrorMessage = (err) => {
    const raw = (err?.response?.data?.message || err?.message || "").toLowerCase();
    if (
      raw.includes("not found") ||
      raw.includes("no user") ||
      raw.includes("no account") ||
      raw.includes("register")
    ) {
      return "No account found for this email. Please register first to access.";
    }
    if (raw.includes("password") || raw.includes("credential")) {
      return "Incorrect password. Please try again.";
    }
    if (raw.includes("email")) {
      return "We couldn't verify that email. Please check and try again.";
    }
    return err?.response?.data?.message || "Login failed. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await login(email, password, "/auth/login");
      setError(null);
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="card auth-card">
        <h2>Login</h2>
        <p className="muted">Use your college credentials to continue.</p>
        {error && <div className="alert danger">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="24B11CS###@adityauniversity.in"
              className="light-placeholder"
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <button className="btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        {!token && (
          <p className="muted auth-hint">
            New here? <Link to="/register">Register first</Link> to access your account.
          </p>
        )}
      </div>
    </section>
  );
}
