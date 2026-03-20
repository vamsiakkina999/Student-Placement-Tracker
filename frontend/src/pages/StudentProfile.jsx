import { useEffect, useState } from "react";
import api from "../api.js";

const emptyProfile = {
  name: "",
  email: "",
  rollNumber: "",
  branch: "",
  batch: "",
  year: "",
  cgpa: "",
  backlogs: "",
  phone: "",
  skills: "",
  resumeUrl: "",
  status: "NOT_PLACED",
};

export default function StudentProfile() {
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/students/me");
        setForm({
          name: data.name || "",
          email: data.email || "",
          rollNumber: data.rollNumber || "",
          branch: data.branch || "",
          batch: data.batch || "",
          year: data.year || "",
          cgpa: data.cgpa ?? "",
          backlogs: data.backlogs ?? "",
          phone: data.phone || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          resumeUrl: data.resumeUrl || "",
          status: data.status || data.placementStatus || "NOT_PLACED",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { data } = await api.put("/students/me", {
        name: form.name,
        branch: form.branch,
        batch: form.batch,
        year: form.year,
        cgpa: form.cgpa ? Number(form.cgpa) : 0,
        backlogs: form.backlogs ? Number(form.backlogs) : 0,
        status: form.status,
        phone: form.phone,
        skills: form.skills,
        resumeUrl: form.resumeUrl,
      });
      await api.post("/students/refresh-eligibility");
      setForm({
        name: data.name || "",
        email: data.email || "",
        rollNumber: data.rollNumber || "",
        branch: data.branch || "",
        batch: data.batch || "",
        year: data.year || "",
        cgpa: data.cgpa ?? "",
        backlogs: data.backlogs ?? "",
        phone: data.phone || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
        resumeUrl: data.resumeUrl || "",
        status: data.status || data.placementStatus || "NOT_PLACED",
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p className="muted">Keep your profile updated to unlock eligibility.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="grid two-col">
            <label>
              Full Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" value={form.email} disabled />
            </label>
            <label>
              Roll Number
              <input name="rollNumber" value={form.rollNumber} disabled />
            </label>
            <label>
              Branch
              <input name="branch" value={form.branch} onChange={handleChange} />
            </label>
            <label>
              Batch
              <input name="batch" value={form.batch} onChange={handleChange} />
            </label>
            <label>
              Year
              <input name="year" value={form.year} onChange={handleChange} />
            </label>
            <label>
              CGPA
              <input
                name="cgpa"
                value={form.cgpa}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="NOT_PLACED">Not Placed</option>
                <option value="PLACED">Placed</option>
              </select>
            </label>
            <label>
              Backlogs
              <input name="backlogs" value={form.backlogs} onChange={handleChange} />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                pattern="\\d{10}"
                title="Enter 10-digit mobile number"
              />
            </label>
            <label>
              Skills (comma separated)
              <input name="skills" value={form.skills} onChange={handleChange} />
            </label>
            <label>
              Resume URL
              <input
                name="resumeUrl"
                value={form.resumeUrl}
                onChange={handleChange}
              />
            </label>
          </div>
          <button className="btn" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </section>
  );
}
