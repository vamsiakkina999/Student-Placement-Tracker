import { useEffect, useState } from "react";
import api from "../api.js";
import JobCard from "../components/JobCard.jsx";

export default function Eligibility() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        await api.post("/students/refresh-eligibility");
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          api.get("/students/me"),
          api.get("/jobs/eligible"),
          api.get("/applications/my"),
        ]);
        setProfile(profileRes.data);
        setJobs(jobsRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load eligibility");
      }
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setError(null);
    setMessage(null);
    try {
      await api.post("/students/refresh-eligibility");
      const { data } = await api.get("/jobs/eligible");
      setJobs(data);
      setMessage("Eligibility refreshed.");
    } catch (err) {
      if (!err.response) {
        setError("Server not reachable. Please restart the backend.");
        return;
      }
      setError(err.response?.data?.message || "Failed to refresh eligibility");
    }
  };

  const appliedJobIds = new Set(applications.map((app) => app.job?._id));
  const eligibleUnapplied = jobs.filter((job) => job && !appliedJobIds.has(job._id));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Eligibility</h2>
          <p className="muted">See the drives you currently qualify for.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {profile && (
        <div className="grid three-col">
          <div className="card">
            <div className="pill">CGPA</div>
            <h3>{profile.cgpa ?? "NA"}</h3>
          </div>
          <div className="card">
            <div className="pill">Backlogs</div>
            <h3>{profile.backlogs ?? 0}</h3>
          </div>
          <div className="card">
            <div className="pill">Branch</div>
            <h3>{profile.branch || "NA"}</h3>
          </div>
        </div>
      )}

      <div className="card">
        <div className="page-header">
          <div>
            <h3>Eligible Drives ({eligibleUnapplied.length})</h3>
          </div>
          <button className="btn ghost" onClick={handleRefresh}>
            Refresh Eligibility
          </button>
        </div>
        {eligibleUnapplied.length === 0 ? (
          <p className="muted">No eligible drives yet. Update your profile.</p>
        ) : (
          <div className="grid cards-grid">
            {eligibleUnapplied.map((job) => (
              <JobCard key={job._id} job={job} showCheck profile={profile} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
