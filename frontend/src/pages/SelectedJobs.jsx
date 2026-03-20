import { useEffect, useState } from "react";
import api from "../api.js";
import JobCard from "../components/JobCard.jsx";

export default function SelectedJobs() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/applications/my");
        setSelected(data.filter((app) => app.status === "SELECTED"));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load selections");
      }
    };
    load();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Selected</h2>
          <p className="muted">Your confirmed selections appear here.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}

      {selected.length === 0 ? (
        <p className="muted">No selections yet.</p>
      ) : (
        <div className="grid cards-grid">
          {selected.map((app) => (
            <JobCard key={app._id} job={app.job} statusLabel={app.status} />
          ))}
        </div>
      )}
    </section>
  );
}
