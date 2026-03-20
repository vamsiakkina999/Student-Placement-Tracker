import { useEffect, useState } from "react";
import api from "../api.js";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/notifications/my");
    setItems(data);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    await load();
  };

  return (
    <div className="notif">
      <button className="btn ghost" onClick={() => setOpen((v) => !v)}>
        Alerts {unread > 0 && <span className="pill">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel card">
          <h4>Notifications</h4>
          {items.length === 0 ? (
            <p className="muted">No notifications yet.</p>
          ) : (
            <div className="notif-list">
              {items.map((n) => (
                <div key={n._id} className={`notif-item ${n.read ? "" : "unread"}`}>
                  <div>
                    <strong>{n.title}</strong>
                    <p className="muted">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button className="btn ghost" onClick={() => markRead(n._id)}>
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
