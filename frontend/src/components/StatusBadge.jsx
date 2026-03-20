export default function StatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();
  const classes = {
    APPLIED: "badge",
    SHORTLISTED: "badge success",
    INTERVIEW: "badge warning",
    SELECTED: "badge success",
    REJECTED: "badge danger",
  };

  return <span className={classes[normalized] || "badge"}>{normalized}</span>;
}
