import { useEffect, useState } from "react";
import api from "../api.js";

const emptyJob = {
  company: "",
  jobRole: "",
  title: "",
  description: "",
  location: "",
  package: "",
  lastDateToApply: "",
  eligibility: {
    minCGPA: "",
    allowedBranches: "",
    requiredSkills: "",
    requiredStatus: "NOT_PLACED",
    maxBacklogs: "",
  },
};

export default function AdminDrives() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobForm, setJobForm] = useState(emptyJob);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [editForm, setEditForm] = useState(emptyJob);

  const load = async () => {
    const [jobsRes, companiesRes] = await Promise.all([
      api.get("/jobs"),
      api.get("/admin/companies"),
    ]);
    setJobs(jobsRes.data);
    setCompanies(companiesRes.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load drives");
      }
    };
    init();
  }, []);

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("eligibility.")) {
      const key = name.split(".")[1];
      setJobForm((prev) => ({
        ...prev,
        eligibility: { ...prev.eligibility, [key]: value },
      }));
      return;
    }
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("eligibility.")) {
      const key = name.split(".")[1];
      setEditForm((prev) => ({
        ...prev,
        eligibility: { ...prev.eligibility, [key]: value },
      }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDetails = (job) => {
    setActiveJob(job);
    setDetailsOpen(true);
  };

  const openEdit = (job) => {
    setActiveJob(job);
    setEditForm({
      company: job.company?._id || job.company || "",
      jobRole: job.jobRole || "",
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      package: job.package ?? "",
      lastDateToApply: job.lastDateToApply
        ? new Date(job.lastDateToApply).toISOString().slice(0, 10)
        : "",
      eligibility: {
        minCGPA: job.eligibility?.minCGPA ?? "",
        allowedBranches: Array.isArray(job.eligibility?.allowedBranches)
          ? job.eligibility.allowedBranches.join(", ")
          : "",
        requiredSkills: Array.isArray(job.eligibility?.requiredSkills)
          ? job.eligibility.requiredSkills.join(", ")
          : "",
        requiredStatus: job.eligibility?.requiredStatus || "NOT_PLACED",
        maxBacklogs: job.eligibility?.maxBacklogs ?? "",
      },
    });
    setEditOpen(true);
  };

  const closeModals = () => {
    setDetailsOpen(false);
    setEditOpen(false);
    setActiveJob(null);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const branches = jobForm.eligibility.allowedBranches
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      const skills = jobForm.eligibility.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (skills.length === 0) {
        setError("Please add required skills before publishing the drive.");
        return;
      }

      const payload = {
        company: jobForm.company,
        jobRole: jobForm.jobRole,
        title: jobForm.title || undefined,
        description: jobForm.description || undefined,
        location: jobForm.location || undefined,
        package: jobForm.package ? Number(jobForm.package) : undefined,
        lastDateToApply: jobForm.lastDateToApply || undefined,
        eligibility: {
          minCGPA: jobForm.eligibility.minCGPA
            ? Number(jobForm.eligibility.minCGPA)
            : undefined,
          allowedBranches: branches,
          requiredSkills: skills,
          requiredStatus: jobForm.eligibility.requiredStatus || "NOT_PLACED",
          maxBacklogs: jobForm.eligibility.maxBacklogs
            ? Number(jobForm.eligibility.maxBacklogs)
            : undefined,
        },
      };
      await api.post("/jobs", payload);
      setMessage("Drive created successfully.");
      setJobForm(emptyJob);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create drive");
    }
  };

  const handleDeleteJob = async (id) => {
    await api.delete(`/jobs/${id}`);
    await load();
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const branches = editForm.eligibility.allowedBranches
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      const skills = editForm.eligibility.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        company: editForm.company,
        jobRole: editForm.jobRole,
        title: editForm.title || undefined,
        description: editForm.description || undefined,
        location: editForm.location || undefined,
        package: editForm.package ? Number(editForm.package) : undefined,
        lastDateToApply: editForm.lastDateToApply || undefined,
        eligibility: {
          minCGPA: editForm.eligibility.minCGPA
            ? Number(editForm.eligibility.minCGPA)
            : undefined,
          allowedBranches: branches,
          requiredSkills: skills,
          requiredStatus: editForm.eligibility.requiredStatus || "NOT_PLACED",
          maxBacklogs: editForm.eligibility.maxBacklogs
            ? Number(editForm.eligibility.maxBacklogs)
            : undefined,
        },
      };
      await api.put(`/jobs/${activeJob._id}`, payload);
      setMessage("Drive updated successfully.");
      closeModals();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update drive");
    }
  };

  const loadEligibleStudents = async (jobId) => {
    if (!jobId) {
      setEligibleStudents([]);
      return;
    }
    const { data } = await api.get(`/jobs/${jobId}/eligible`);
    setEligibleStudents(data);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Drives</h2>
          <p className="muted">Create drives and review eligible students.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {detailsOpen && activeJob && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-details">
            <div className="modal-details-header">
              <h3>Drive Details</h3>
              <button className="btn ghost" onClick={closeModals}>
                Close
              </button>
            </div>
            <div className="modal-details-grid">
              <div className="detail-item">
                <span className="detail-label">Company</span>
                <div className="detail-value">{activeJob.company?.name || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Job Role</span>
                <div className="detail-value">{activeJob.jobRole || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Title</span>
                <div className="detail-value">{activeJob.title || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <div className="detail-value">{activeJob.location || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Package (LPA)</span>
                <div className="detail-value">
                  {activeJob.package != null ? activeJob.package : "NA"}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Date</span>
                <div className="detail-value">
                  {activeJob.lastDateToApply
                    ? new Date(activeJob.lastDateToApply).toLocaleDateString()
                    : "NA"}
                </div>
              </div>
              <div className="detail-item modal-details-span">
                <span className="detail-label">Description</span>
                <div className="detail-value">{activeJob.description || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Min CGPA</span>
                <div className="detail-value">
                  {activeJob.eligibility?.minCGPA ?? "NA"}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Allowed Branches</span>
                <div className="detail-value">
                  {Array.isArray(activeJob.eligibility?.allowedBranches) &&
                  activeJob.eligibility.allowedBranches.length > 0
                    ? activeJob.eligibility.allowedBranches.join(", ")
                    : "NA"}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Required Skills</span>
                <div className="detail-value">
                  {Array.isArray(activeJob.eligibility?.requiredSkills) &&
                  activeJob.eligibility.requiredSkills.length > 0
                    ? activeJob.eligibility.requiredSkills.join(", ")
                    : "NA"}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Required Status</span>
                <div className="detail-value">
                  {activeJob.eligibility?.requiredStatus || "NA"}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Max Backlogs</span>
                <div className="detail-value">
                  {activeJob.eligibility?.maxBacklogs ?? "NA"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && activeJob && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-details">
            <div className="modal-details-header">
              <h3>Edit Drive</h3>
              <button className="btn ghost" onClick={closeModals}>
                Close
              </button>
            </div>
            <form className="form" onSubmit={handleUpdateJob}>
              <label>
                Company
                <select
                  name="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Job Role / Title
                <input
                  name="jobRole"
                  value={editForm.jobRole}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Title (optional)
                <input name="title" value={editForm.title} onChange={handleEditChange} />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  rows="3"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Location
                <input name="location" value={editForm.location} onChange={handleEditChange} />
              </label>
              <label>
                Package (LPA)
                <input name="package" value={editForm.package} onChange={handleEditChange} />
              </label>
              <label>
                Last Date To Apply
                <input
                  type="date"
                  name="lastDateToApply"
                  value={editForm.lastDateToApply}
                  onChange={handleEditChange}
                />
              </label>
              <div className="grid three-col">
                <label>
                  Min CGPA
                  <input
                    name="eligibility.minCGPA"
                    value={editForm.eligibility.minCGPA}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  Allowed Branches
                  <input
                    name="eligibility.allowedBranches"
                    value={editForm.eligibility.allowedBranches}
                    onChange={handleEditChange}
                    placeholder="CSE, ECE"
                  />
                </label>
                <label>
                  Required Skills
                  <input
                    name="eligibility.requiredSkills"
                    value={editForm.eligibility.requiredSkills}
                    onChange={handleEditChange}
                    placeholder="React, Node"
                    required
                  />
                </label>
                <label>
                  Required Status
                  <select
                    name="eligibility.requiredStatus"
                    value={editForm.eligibility.requiredStatus}
                    onChange={handleEditChange}
                  >
                    <option value="NOT_PLACED">Not Placed</option>
                    <option value="PLACED">Placed</option>
                  </select>
                </label>
                <label>
                  Max Backlogs
                  <input
                    name="eligibility.maxBacklogs"
                    value={editForm.eligibility.maxBacklogs}
                    onChange={handleEditChange}
                  />
                </label>
              </div>
              <button className="btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid two-col">
        <div className="card">
          <h3>Create Job Drive</h3>
          <form className="form" onSubmit={handleCreateJob}>
            <label>
              Company
              <select
                name="company"
                value={jobForm.company}
                onChange={handleJobChange}
                required
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Job Role / Title
              <input
                name="jobRole"
                value={jobForm.jobRole}
                onChange={handleJobChange}
                required
              />
            </label>
            <label>
              Title (optional)
              <input name="title" value={jobForm.title} onChange={handleJobChange} />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="3"
                value={jobForm.description}
                onChange={handleJobChange}
              />
            </label>
            <label>
              Location
              <input name="location" value={jobForm.location} onChange={handleJobChange} />
            </label>
            <label>
              Package (LPA)
              <input
                name="package"
                value={jobForm.package}
                onChange={handleJobChange}
              />
            </label>
            <label>
              Last Date To Apply
              <input
                type="date"
                name="lastDateToApply"
                value={jobForm.lastDateToApply}
                onChange={handleJobChange}
              />
            </label>
            <div className="grid three-col">
              <label>
                Min CGPA
                <input
                  name="eligibility.minCGPA"
                  value={jobForm.eligibility.minCGPA}
                  onChange={handleJobChange}
                />
              </label>
              <label>
                Allowed Branches
                <input
                  name="eligibility.allowedBranches"
                  value={jobForm.eligibility.allowedBranches}
                  onChange={handleJobChange}
                  placeholder="CSE, ECE"
                />
              </label>
              <label>
                Required Skills
                <input
                  name="eligibility.requiredSkills"
                  value={jobForm.eligibility.requiredSkills}
                  onChange={handleJobChange}
                  placeholder="React, Node"
                  required
                />
              </label>
              <label>
                Required Status
                <select
                  name="eligibility.requiredStatus"
                  value={jobForm.eligibility.requiredStatus}
                  onChange={handleJobChange}
                >
                  <option value="NOT_PLACED">Not Placed</option>
                  <option value="PLACED">Placed</option>
                </select>
              </label>
              <label>
                Max Backlogs
                <input
                  name="eligibility.maxBacklogs"
                  value={jobForm.eligibility.maxBacklogs}
                  onChange={handleJobChange}
                />
              </label>
            </div>
            <button className="btn">Publish Drive</button>
          </form>
        </div>

        <div className="card">
          <h3>Eligible Students</h3>
          <label>
            Select Drive
            <select
              value={selectedJobId}
              onChange={(e) => {
                const jobId = e.target.value;
                setSelectedJobId(jobId);
                loadEligibleStudents(jobId);
              }}
            >
              <option value="">Select job drive</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.jobRole}
                </option>
              ))}
            </select>
          </label>
          {eligibleStudents.length === 0 ? (
            <p className="muted">No eligible students yet.</p>
          ) : (
            <div className="table">
              {eligibleStudents.map((student) => (
                <div key={student._id} className="table-row">
                  <div>
                    <strong>{student.name}</strong>
                    <p className="muted">{student.email}</p>
                  </div>
                  <div className="table-actions">
                    <div className="pill">{student.branch || "NA"}</div>
                    <div className="pill">CGPA {student.cgpa ?? "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Job Drives</h3>
        {jobs.length === 0 ? (
          <p className="muted">No job drives yet.</p>
        ) : (
          <div className="table">
            {jobs.map((job) => (
              <div key={job._id} className="table-row">
                <div>
                  <strong>{job.company?.name}</strong>
                  <p className="muted">{job.jobRole}</p>
                </div>
                <div className="table-actions">
                  <div className="pill">
                    {job.lastDateToApply
                      ? new Date(job.lastDateToApply).toLocaleDateString()
                      : "No deadline"}
                  </div>
                  <button className="btn ghost" onClick={() => openDetails(job)}>
                    Details
                  </button>
                  <button className="btn ghost" onClick={() => openEdit(job)}>
                    Edit
                  </button>
                  <button className="btn ghost" onClick={() => handleDeleteJob(job._id)}>
                    Delete
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
