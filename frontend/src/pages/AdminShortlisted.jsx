import { useEffect, useState } from "react";
import api from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminShortlisted() {
  const [shortlisted, setShortlisted] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    const { data } = await api.get("/applications");
    setShortlisted(data.filter((app) => app.status === "SHORTLISTED"));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load shortlisted list");
      }
    };
    init();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    await load();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Shortlisted Students</h2>
          <p className="muted">Candidates currently shortlisted for drives.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}

      <div className="card">
        {shortlisted.length === 0 ? (
          <p className="muted">No shortlisted students yet.</p>
        ) : (
          <div className="table">
            {shortlisted.map((app) => (
              <div key={app._id} className="table-row">
                <div>
                  <strong>{app.student?.name}</strong>
                  <p className="muted">
                    {app.job?.company?.name} - {app.job?.jobRole}
                  </p>
                  <div className="job-meta">
                    <span>Email: {app.student?.email || "NA"}</span>
                    <span>Roll: {app.student?.rollNumber || "NA"}</span>
                    <span>Branch: {app.student?.branch || "NA"}</span>
                    <span>Batch: {app.student?.batch || "NA"}</span>
                    <span>Year: {app.student?.year || "NA"}</span>
                    <span>CGPA: {app.student?.cgpa ?? "NA"}</span>
                    <span>Backlogs: {app.student?.backlogs ?? "0"}</span>
                    <span>Status: {app.student?.status || app.student?.placementStatus}</span>
                    <span>Phone: {app.student?.phone || "NA"}</span>
                    <span>
                      Skills:{" "}
                      {Array.isArray(app.student?.skills) && app.student.skills.length > 0
                        ? app.student.skills.join(", ")
                        : "NA"}
                    </span>
                    <span>
                      Resume:{" "}
                      {app.student?.resumeUrl ? (
                        <a href={app.student.resumeUrl} target="_blank" rel="noreferrer">
                          View Resume
                        </a>
                      ) : (
                        "NA"
                      )}
                    </span>
                  </div>
                </div>
                <div className="table-actions">
                  <StatusBadge status={app.status} />
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                  >
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="SELECTED">SELECTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
