import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [jobs, setJobs] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/jobs/public");
        setJobs(data);
      } catch (err) {
        setJobs([]);
      }
    };
    load();
  }, []);

  const tickerItems =
    jobs.length > 0
      ? jobs
      : [{ _id: "0", jobRole: "New drives will appear here soon." }];

  return (
    <section className="home-hero full-hero">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Student Placement Tracker</p>
          <h1>Your placement command center.</h1>
          <p className="muted">
            Manage campus drives, verify eligibility, and track applications with a
            single platform built for students and admins.
          </p>
        </div>
        <div className="hero-divider" />
        <div className="hero-ticker-block">
          <div className="ticker-header">
            {!token && (
              <div className="get-started-inline">
                <button
                  className="corner-btn"
                  type="button"
                  onClick={() => setShowAuth((prev) => !prev)}
                  aria-expanded={showAuth}
                  aria-controls="start-actions"
                >
                  Get Started
                </button>
                <div
                  id="start-actions"
                  className={`corner-actions ${showAuth ? "show" : ""}`}
                >
                  <Link className="btn" to="/register">
                    Register
                  </Link>
                  <Link className="btn ghost" to="/login">
                    Login
                  </Link>
                </div>
              </div>
            )}
            <div className="ticker-label">Latest Drives</div>
          </div>
          <div className="ticker-track wide tall">
            <div className="ticker-items">
              {tickerItems.map((job) => (
                <span key={job._id} className="ticker-item">
                  {job.company?.name ? `${job.company.name} • ` : ""}
                  {job.jobRole || job.title}
                  {job.package ? ` • ${job.package} LPA` : ""}
                  {job.location ? ` • ${job.location}` : ""}
                  {job.lastDateToApply
                    ? ` • Apply by ${new Date(job.lastDateToApply).toLocaleDateString()}`
                    : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
