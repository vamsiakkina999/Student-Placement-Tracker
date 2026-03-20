export default function About() {
  return (
    <section className="page">
      <h2>About Placement Tracker</h2>
      <p className="muted">
        Student Placement Tracker is a full‑stack web platform built to streamline
        campus placement management for students and administrators. It centralizes
        job drives, eligibility checks, applications, and status tracking so the
        entire placement journey happens in one organized workspace.
      </p>
      <p className="muted">
        Students can register with institutional email formats, complete their
        profiles, check eligibility instantly, and apply to drives with clear
        feedback. Administrators can publish drives, shortlist candidates, review
        applications, and confirm selections with role‑specific dashboards.
      </p>
      <div className="grid two-col">
        <div className="card">
          <h3>Tech Stack</h3>
          <ul className="clean-list">
            <li>Frontend: React (Vite), JSX, CSS</li>
            <li>Backend: Node.js, Express.js</li>
            <li>Database: MongoDB (Mongoose ODM)</li>
            <li>Auth: JWT, bcrypt</li>
            <li>Email: Nodemailer</li>
          </ul>
        </div>
        <div className="card">
          <h3>Team</h3>
          <ul className="clean-list">
            <li>Vamsi Durga Akkina</li>
            <li>NB Akiranandan</li>
            <li>Jyothiesh Kasala</li>
            <li>Venkat Kumar Thuraka</li>
            <li>Tejas Rajaboina</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
