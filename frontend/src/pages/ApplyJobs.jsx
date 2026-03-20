import { useEffect, useState } from "react";
import api from "../api.js";
import JobCard from "../components/JobCard.jsx";

export default function ApplyJobs() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const [jobsRes, profileRes, appsRes] = await Promise.all([
      api.get("/jobs/all"),
      api.get("/students/me"),
      api.get("/applications/my"),
    ]);
    setJobs(jobsRes.data);
    setProfile(profileRes.data);
    setApplications(appsRes.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      }
    };
    init();
  }, []);

  const handleApply = async (jobId) => {
    setMessage(null);
    setError(null);
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setMessage("Applied successfully.");
      const appsRes = await api.get("/applications/my");
      setApplications(appsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Application failed");
    }
  };

  const statusByJob = applications.reduce((acc, app) => {
    if (app.job?._id) acc[app.job._id] = app.status;
    return acc;
  }, {});
  const visibleJobs = jobs.filter((job) => statusByJob[job._id] !== "SELECTED");

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Apply Jobs</h2>
          <p className="muted">Browse all drives and check eligibility instantly.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {jobs.length === 0 ? (
        <p className="muted">No job drives available.</p>
      ) : (
        <div className="grid cards-grid cards-grid-single">
          {visibleJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApply}
              showApply
              showCheck
              profile={profile}
              statusLabel={statusByJob[job._id]}
              applyDisabled={Boolean(statusByJob[job._id])}
            />
          ))}
        </div>
      )}
    </section>
  );
}
