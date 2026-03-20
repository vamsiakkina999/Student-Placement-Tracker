import { useEffect, useState } from "react";
import api from "../api.js";

const emptyCompany = {
  name: "",
  hrEmail: "",
  contactNumber: "",
  address: "",
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState(null);
  const [editForm, setEditForm] = useState(emptyCompany);

  const load = async () => {
    const { data } = await api.get("/admin/companies");
    setCompanies(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await load();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load companies");
      }
    };
    init();
  }, []);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDetails = (company) => {
    setActiveCompany(company);
    setDetailsOpen(true);
  };

  const openEdit = (company) => {
    setActiveCompany(company);
    setEditForm({
      name: company.name || "",
      hrEmail: company.hrEmail || "",
      contactNumber: company.contactNumber || "",
      address: company.address || "",
    });
    setEditOpen(true);
  };

  const closeModals = () => {
    setDetailsOpen(false);
    setEditOpen(false);
    setActiveCompany(null);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await api.post("/admin/companies", companyForm);
      setMessage("Company added successfully.");
      setCompanyForm(emptyCompany);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create company");
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await api.put(`/admin/companies/${activeCompany._id}`, editForm);
      setMessage("Company updated successfully.");
      closeModals();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update company");
    }
  };

  const handleDeleteCompany = async (id) => {
    setMessage(null);
    setError(null);
    try {
      await api.delete(`/admin/companies/${id}`);
      setMessage("Company deleted successfully.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete company");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Companies</h2>
          <p className="muted">Manage recruiters and company details.</p>
        </div>
      </div>

      {error && <div className="alert danger">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {detailsOpen && activeCompany && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-details">
            <div className="modal-details-header">
              <h3>Company Details</h3>
              <button className="btn ghost" onClick={closeModals}>
                Close
              </button>
            </div>
            <div className="modal-details-grid">
              <div className="detail-item">
                <span className="detail-label">Company Name</span>
                <div className="detail-value">{activeCompany.name || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">HR Email</span>
                <div className="detail-value">{activeCompany.hrEmail || "NA"}</div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Number</span>
                <div className="detail-value">{activeCompany.contactNumber || "NA"}</div>
              </div>
              <div className="detail-item modal-details-span">
                <span className="detail-label">Address</span>
                <div className="detail-value">{activeCompany.address || "NA"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && activeCompany && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-details">
            <div className="modal-details-header">
              <h3>Edit Company</h3>
              <button className="btn ghost" onClick={closeModals}>
                Close
              </button>
            </div>
            <form className="form" onSubmit={handleUpdateCompany}>
              <label>
                Company Name
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                HR Email
                <input name="hrEmail" value={editForm.hrEmail} onChange={handleEditChange} />
              </label>
              <label>
                Contact Number
                <input
                  name="contactNumber"
                  value={editForm.contactNumber}
                  onChange={handleEditChange}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Enter 10-digit contact number"
                />
              </label>
              <label>
                Address
                <textarea
                  name="address"
                  rows="3"
                  value={editForm.address}
                  onChange={handleEditChange}
                />
              </label>
              <button className="btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid two-col">
        <div className="card">
          <h3>Add Company</h3>
          <form className="form" onSubmit={handleCreateCompany}>
            <label>
              Company Name
              <input
                name="name"
                value={companyForm.name}
                onChange={handleCompanyChange}
                required
              />
            </label>
            <label>
              HR Email
              <input
                name="hrEmail"
                value={companyForm.hrEmail}
                onChange={handleCompanyChange}
              />
            </label>
            <label>
              Contact Number
              <input
                name="contactNumber"
                value={companyForm.contactNumber}
                onChange={handleCompanyChange}
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                title="Enter 10-digit contact number"
              />
            </label>
            <label>
              Address
              <textarea
                name="address"
                rows="3"
                value={companyForm.address}
                onChange={handleCompanyChange}
              />
            </label>
            <button className="btn">Save Company</button>
          </form>
        </div>

        <div className="card">
          <h3>Company List</h3>
          {companies.length === 0 ? (
            <p className="muted">No companies yet.</p>
          ) : (
            <div className="table">
              {companies.map((company) => (
                <div key={company._id} className="table-row">
                  <div>
                    <strong>{company.name}</strong>
                    <p className="muted">{company.hrEmail || "No HR email"}</p>
                  </div>
                  <div className="table-actions">
                    <div className="pill">{company.contactNumber || "NA"}</div>
                    <button className="btn ghost" onClick={() => openDetails(company)}>
                      Details
                    </button>
                    <button className="btn ghost" onClick={() => openEdit(company)}>
                      Edit
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => handleDeleteCompany(company._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
