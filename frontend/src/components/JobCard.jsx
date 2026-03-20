import { useState } from "react";

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const checkEligibility = (profile, job) => {
  if (!profile) return { ok: false, reason: "Complete your profile first." };

  const eligibility = job.eligibility || {};
  const allowedBranches = eligibility.allowedBranches || [];
  if (allowedBranches.length > 0 && !allowedBranches.includes(profile.branch)) {
    return { ok: false, reason: "Branch requirement not met." };
  }

  if (eligibility.minCGPA && Number(profile.cgpa || 0) < Number(eligibility.minCGPA)) {
    return { ok: false, reason: "CGPA requirement not met." };
  }

  if (
    eligibility.maxBacklogs != null &&
    Number(profile.backlogs || 0) > Number(eligibility.maxBacklogs)
  ) {
    return { ok: false, reason: "Backlogs requirement not met." };
  }

  const requiredSkills = normalizeSkills(eligibility.requiredSkills);
  const studentSkills = normalizeSkills(profile.skills);
  if (requiredSkills.length > 0) {
    const hasAll = requiredSkills.every((skill) => studentSkills.includes(skill));
    if (!hasAll) {
      return { ok: false, reason: "Required skills missing." };
    }
  }

  const requiredStatus = eligibility.requiredStatus || "NOT_PLACED";
  const studentStatus = profile.status || profile.placementStatus || "NOT_PLACED";
  if (requiredStatus && studentStatus !== requiredStatus) {
    return { ok: false, reason: "Placement status requirement not met." };
  }

  return { ok: true, reason: "You are eligible to apply." };
};

export default function JobCard({
  job,
  onApply,
  showApply,
  showCheck = false,
  profile,
  statusLabel,
  applyDisabled = false,
}) {
  const rawCompany =
    job.company?.name ||
    job.companyName ||
    (typeof job.company === "string" ? job.company : "");
  const companyName = rawCompany && !/^[0-9a-fA-F]{24}$/.test(rawCompany)
    ? rawCompany
    : "Company";
  const requiredSkills =
    job.eligibility?.requiredSkills && job.eligibility.requiredSkills.length > 0
      ? job.eligibility.requiredSkills.join(", ")
      : "Any";
  const allowedBranches =
    job.eligibility?.allowedBranches && job.eligibility.allowedBranches.length > 0
      ? job.eligibility.allowedBranches.join(", ")
      : "Any";
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const handleCheck = () => {
    setEligibilityResult(checkEligibility(profile, job));
  };

  return (
    <div className="card job-card job-rect">
      <div className="job-logo">
        <div className="logo-badge">{companyName.slice(0, 2).toUpperCase()}</div>
      </div>
      <div className="job-content">
        <div className="job-card-header">
          <div>
            <h3>{companyName}</h3>
            <p className="muted">{job.title || job.jobRole}</p>
          </div>
          {job.lastDateToApply && (
            <div className="pill">
              Apply by {new Date(job.lastDateToApply).toLocaleDateString()}
            </div>
          )}
        </div>
        {job.description && <p className="muted">{job.description}</p>}
        <div className="job-meta">
          <span>Package: {job.package ? `${job.package} LPA` : "TBD"}</span>
          <span>Location: {job.location || "TBD"}</span>
          <span>Min CGPA: {job.eligibility?.minCGPA ?? "Any"}</span>
          <span>Branches: {allowedBranches}</span>
          <span>Max Backlogs: {job.eligibility?.maxBacklogs ?? "Any"}</span>
          <span>Skills: {requiredSkills}</span>
        </div>
        <div className="job-actions">
          {showApply && (
            <button
              className="btn"
              onClick={() => onApply(job._id)}
              disabled={applyDisabled}
            >
              {applyDisabled && statusLabel ? statusLabel : "Apply"}
            </button>
          )}
          {showCheck && (
            <button className="btn ghost" onClick={handleCheck}>
              Check Eligible
            </button>
          )}
        </div>
        {eligibilityResult && (
          <div
            className={`eligibility-pill ${
              eligibilityResult.ok ? "eligible" : "not-eligible"
            }`}
          >
            {eligibilityResult.reason}
          </div>
        )}
        {statusLabel && <div className="status-pill">{statusLabel}</div>}
      </div>
    </div>
  );
}
