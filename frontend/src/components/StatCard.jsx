export default function StatCard({ label, value }) {
  return (
    <div className="card stat-card">
      <p className="muted">{label}</p>
      <h3>{value}</h3>
    </div>
  );
}
