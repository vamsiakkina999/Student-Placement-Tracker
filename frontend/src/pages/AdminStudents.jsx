import { useEffect, useState } from "react";
import api from "../api.js";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [studentFilters, setStudentFilters] = useState({
    branch: "",
    minCgpa: "",
    skills: "",
    status: "",
    year: "",
  });
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  const load = async (query = "") => {
    const { data } = await api.get(`/admin/students${query}`);
    setStudents(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load students");
      }
    };
    init();
  }, []);

  const handleStudentFilterChange = (e) => {
    const { name, value } = e.target;
    setStudentFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyStudentFilters = async () => {
    const params = new URLSearchParams();
    Object.entries(studentFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    await load(`?${params.toString()}`);
  };

  const openDetails = async (studentId) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setStudentDetails(null);
    try {
      const { data } = await api.get(`/admin/students/${studentId}`);
      setStudentDetails(data);
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Failed to load student details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsError(null);
    setStudentDetails(null);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p className="muted">Filter and review student profiles.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {detailsOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-details">
            <div className="modal-details-header">
              <h3>Student Details</h3>
              <button className="btn ghost" onClick={closeDetails}>
                Close
              </button>
            </div>
            {detailsLoading && <p className="muted">Loading profile...</p>}
            {detailsError && <div className="alert danger">{detailsError}</div>}
            {studentDetails && (
              <div className="modal-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <div className="detail-value">{studentDetails.name || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <div className="detail-value">{studentDetails.email || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Roll Number</span>
                  <div className="detail-value">{studentDetails.rollNumber || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Branch</span>
                  <div className="detail-value">{studentDetails.branch || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Batch</span>
                  <div className="detail-value">{studentDetails.batch || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Year</span>
                  <div className="detail-value">{studentDetails.year || "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">CGPA</span>
                  <div className="detail-value">{studentDetails.cgpa ?? "NA"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Backlogs</span>
                  <div className="detail-value">{studentDetails.backlogs ?? "0"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <div className="detail-value">
                    {studentDetails.status || studentDetails.placementStatus || "NA"}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <div className="detail-value">{studentDetails.phone || "NA"}</div>
                </div>
                <div className="detail-item modal-details-span">
                  <span className="detail-label">Skills</span>
                  <div className="detail-value">
                    {Array.isArray(studentDetails.skills) && studentDetails.skills.length > 0
                      ? studentDetails.skills.join(", ")
                      : "NA"}
                  </div>
                </div>
                <div className="detail-item modal-details-span">
                  <span className="detail-label">Resume URL</span>
                  <div className="detail-value">{studentDetails.resumeUrl || "NA"}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="grid three-col">
          <label>
            Branch
            <input
              name="branch"
              value={studentFilters.branch}
              onChange={handleStudentFilterChange}
            />
          </label>
          <label>
            Min CGPA
            <input
              name="minCgpa"
              value={studentFilters.minCgpa}
              onChange={handleStudentFilterChange}
            />
          </label>
          <label>
            Skills
            <input
              name="skills"
              value={studentFilters.skills}
              onChange={handleStudentFilterChange}
              placeholder="React, Node"
            />
          </label>
          <label>
            Status
            <select
              name="status"
              value={studentFilters.status}
              onChange={handleStudentFilterChange}
            >
              <option value="">Any</option>
              <option value="NOT_PLACED">Not Placed</option>
              <option value="PLACED">Placed</option>
            </select>
          </label>
          <label>
            Year
            <input
              name="year"
              value={studentFilters.year}
              onChange={handleStudentFilterChange}
            />
          </label>
        </div>
        <button className="btn" onClick={applyStudentFilters}>
          Apply Filters
        </button>

        {students.length === 0 ? (
          <p className="muted">No students found.</p>
        ) : (
          <div className="table">
            {students.map((student) => (
              <div key={student._id} className="table-row">
                <div>
                  <strong>{student.name}</strong>
                  <p className="muted">{student.email}</p>
                </div>
                <div className="table-actions">
                  <div className="pill">{student.branch || "NA"}</div>
                  <div className="pill">CGPA {student.cgpa ?? "-"}</div>
                  <button className="btn ghost" onClick={() => openDetails(student._id)}>
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
