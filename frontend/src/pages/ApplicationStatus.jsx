import { useEffect, useState } from "react";
import api from "../api.js";
import JobCard from "../components/JobCard.jsx";

export default function ApplicationStatus() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/applications/my");
        setApplications(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load applications");
      }
    };
    load();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Applied Jobs</h2>
          <p className="muted">Track your drive progress in one place.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}

      {applications.length === 0 ? (
        <p className="muted">No applications yet.</p>
      ) : (
        <div className="grid cards-grid">
          {applications.map((app) => (
            <JobCard key={app._id} job={app.job} statusLabel={app.status} />
          ))}
        </div>
      )}
    </section>
  );
}
