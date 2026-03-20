import { useEffect, useState } from "react";
import api from "../api.js";
import StatCard from "../components/StatCard.jsx";

export default function StudentDashboard() {
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, appRes, notifRes] = await Promise.all([
          api.get("/jobs/eligible"),
          api.get("/applications/my"),
          api.get("/notifications/my"),
        ]);
        setEligibleJobs(jobsRes.data);
        setApplications(appRes.data);
        setNotifications(notifRes.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };
    load();
  }, []);

  const appliedJobIds = new Set(applications.map((app) => app.job?._id));
  const eligibleUnapplied = eligibleJobs.filter(
    (job) => job && !appliedJobIds.has(job._id)
  );

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Student Dashboard</h2>
          <p className="muted">Overview of your placement journey.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}

      <div className="grid stats-grid">
        <StatCard label="Eligible Drives" value={eligibleUnapplied.length} />
        <StatCard label="Applications" value={applications.length} />
        <StatCard
          label="Placed"
          value={applications.filter((a) => (a.status || "").toUpperCase() === "SELECTED").length}
        />
      </div>

      <div className="grid two-col">
        <div className="card">
          <h3>Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="muted">No updates yet.</p>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => (
                <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
                  <div>
                    <strong>{n.title}</strong>
                    <p className="muted">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Quick Tips</h3>
          <ul className="clean-list">
            <li>Complete your profile to unlock eligibility.</li>
            <li>Use Apply Jobs to view all drives.</li>
            <li>Track your status regularly.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
