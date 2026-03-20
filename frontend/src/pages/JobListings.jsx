import { useEffect, useState } from "react";
import api from "../api.js";
import JobCard from "../components/JobCard.jsx";

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ branch: "", minCgpa: "", maxBacklogs: "" });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadJobs = async () => {
    const { data } = await api.get("/jobs/eligible");
    setJobs(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadJobs();
        const profileRes = await api.get("/students/me");
        setProfile(profileRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      }
    };
    load();
  }, []);

  const handleApply = async (jobId) => {
    setMessage(null);
    setError(null);
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setMessage("Applied successfully.");
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Application failed");
    }
  };

  const filtered = jobs.filter((job) => {
    const text = `${job.company?.name || ""} ${job.jobRole || ""}`.toLowerCase();
    if (!text.includes(query.toLowerCase())) return false;

    if (
      filters.branch &&
      Array.isArray(job.eligibility?.allowedBranches) &&
      job.eligibility.allowedBranches.length > 0 &&
      !job.eligibility.allowedBranches.includes(filters.branch)
    )
      return false;

    if (filters.minCgpa && job.eligibility?.minCGPA) {
      if (Number(filters.minCgpa) > Number(job.eligibility.minCGPA)) return false;
    }

    if (filters.maxBacklogs && job.eligibility?.maxBacklogs != null) {
      if (Number(filters.maxBacklogs) > Number(job.eligibility.maxBacklogs)) return false;
    }

    return true;
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Job Listings</h2>
          <p className="muted">Apply to drives that match your profile.</p>
        </div>
        <input
          className="search"
          placeholder="Search by company or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid three-col">
        <label>
          Allowed Branch
          <input
            value={filters.branch}
            onChange={(e) => setFilters((p) => ({ ...p, branch: e.target.value }))}
            placeholder="CSE"
          />
        </label>
        <label>
          Min CGPA
          <input
            value={filters.minCgpa}
            onChange={(e) => setFilters((p) => ({ ...p, minCgpa: e.target.value }))}
            placeholder="7.0"
          />
        </label>
        <label>
          Max Backlogs
          <input
            value={filters.maxBacklogs}
            onChange={(e) => setFilters((p) => ({ ...p, maxBacklogs: e.target.value }))}
            placeholder="2"
          />
        </label>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="grid cards-grid">
        {filtered.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onApply={handleApply}
            showApply
            showCheck
            profile={profile}
          />
        ))}
      </div>
      {filtered.length === 0 && <p className="muted">No jobs found.</p>}
    </section>
  );
}
