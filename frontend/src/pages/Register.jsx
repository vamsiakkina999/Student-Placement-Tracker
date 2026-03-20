import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

const emptyForm = {
  role: "STUDENT",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,10}$/;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!passwordRegex.test(form.password || "")) {
      setError(
        "Password must be 6-10 characters, lowercase only, and include letters and numbers."
      );
      return;
    }

    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        role: form.role,
        name: fullName,
        email: form.email,
        password: form.password,
      };

      await api.post("/auth/register", payload);
      setMessage(
        form.role === "ADMIN"
          ? "Admin registration successful. You can now log in."
          : "Registration successful. You can now log in."
      );
      setShowSuccess(true);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      {showSuccess && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card success">
            <h3>
              {form.role === "ADMIN"
                ? "Admin Account Ready 🎉"
                : "Registered Successfully 🎉"}
            </h3>
            <p className="modal-quote">Welcome to Placement Tracker</p>
            <button
              className="btn"
              onClick={() => {
                setShowSuccess(false);
                navigate("/login");
              }}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
      <div className="card auth-card">
        <h2>Registration</h2>
        <p className="muted">Choose your role to continue.</p>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert danger">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {form.role === "ADMIN" && (
            <div className="alert warning">
              Only one admin account is allowed for this project.
            </div>
          )}
          <label>
            First Name
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Surname
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={
                form.role === "ADMIN"
                  ? "admin@adityauniversity.in"
                  : "24B11CS###@adityauniversity.in"
              }
              className="light-placeholder"
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                minLength={6}
                maxLength={10}
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
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </section>
  );
}
