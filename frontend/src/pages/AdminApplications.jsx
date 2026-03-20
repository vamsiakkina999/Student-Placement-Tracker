import { useEffect, useState } from "react";
import api from "../api.js";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const load = async () => {
    const { data } = await api.get("/applications");
    setApplications(data.filter((app) => app.status === "APPLIED"));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load applications");
      }
    };
    init();
  }, []);

  const handleShortlist = async (id) => {
    await api.put(`/applications/${id}/status`, { status: "SHORTLISTED" });
    await load();
    setShowSuccess(true);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Applications</h2>
          <p className="muted">Track and update application status.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {showSuccess && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card success">
            <h3>Added Successfully</h3>
            <p className="modal-quote">Student moved to shortlisted list.</p>
            <button className="btn" onClick={() => setShowSuccess(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {applications.length === 0 ? (
          <p className="muted">No applications yet.</p>
        ) : (
          <div className="table">
            {applications.map((app) => (
              <div key={app._id} className="table-row">
                <div>
                  <strong>{app.student?.name}</strong>
                  <p className="muted">
                    {app.job?.company?.name} - {app.job?.jobRole}
                  </p>
                </div>
                <div className="table-actions">
                  {app.status !== "SHORTLISTED" && (
                    <button className="btn" onClick={() => handleShortlist(app._id)}>
                      Add to Shortlisted
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
