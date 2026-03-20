import { useEffect, useState } from "react";
import api from "../api.js";
import StatCard from "../components/StatCard.jsx";

const statusList = ["SHORTLISTED", "SELECTED", "REJECTED"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/applications"),
        ]);
        setStats(statsRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin data");
      }
    };
    load();
  }, []);

  const statusCounts = statusList.reduce((acc, status) => {
    acc[status] = applications.filter((a) => a.status === status).length;
    return acc;
  }, {});

  const maxCount = Math.max(1, ...Object.values(statusCounts));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Overview of drives, applications, and placements.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}

      <div className="grid stats-grid">
        <StatCard label="Students" value={stats?.students ?? "-"} />
        <StatCard label="Drives" value={stats?.drives ?? "-"} />
        <StatCard label="Applications" value={stats?.applications ?? "-"} />
        <StatCard label="Placed" value={stats?.placed ?? "-"} />
      </div>

      <div className="card">
        <h3>Application Funnel</h3>
        <div className="chart">
          {statusList.map((status) => (
            <div key={status} className="chart-row">
              <div className="chart-label">{status}</div>
              <div className="chart-bar">
                <span
                  style={{ width: `${(statusCounts[status] / maxCount) * 100}%` }}
                />
              </div>
              <div className="chart-value">{statusCounts[status]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
