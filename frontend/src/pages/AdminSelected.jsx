import { useEffect, useState } from "react";
import api from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminSelected() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const { data } = await api.get("/applications");
    setSelected(data.filter((app) => app.status === "SELECTED"));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load selected list");
      }
    };
    init();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setError(null);
    setMessage(null);
    await api.put(`/applications/${id}/status`, { status });
    await load();
    setMessage("Selection updated.");
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Selected Students</h2>
          <p className="muted">Confirmed selections by drive.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="card">
        {selected.length === 0 ? (
          <p className="muted">No selected students yet.</p>
        ) : (
          <div className="table">
            {selected.map((app) => (
              <div key={app._id} className="table-row">
                <div>
                  <strong>{app.student?.name}</strong>
                  <p className="muted">
                    {app.job?.company?.name} - {app.job?.jobRole}
                  </p>
                </div>
                <div className="table-actions">
                  <StatusBadge status={app.status} />
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                  >
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
