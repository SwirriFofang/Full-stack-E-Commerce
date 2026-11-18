import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import Pager from "../../components/pager/Pager";
import { formatDate } from "../../utils/format";

const ROLE_LABEL = { customer: "Buyer", seller: "Seller", admin: "Admin" };
const oneOf = (value, allowed) => (allowed.includes(value) ? value : "");

export default function AdminUsers() {
  const [params] = useSearchParams();
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    role: oneOf(params.get("role"), ["seller", "admin"]),
    status: "",
    verified: oneOf(params.get("verified"), ["true", "false"]),
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/admin/users", {
        params: {
          q: filters.q || undefined,
          role: filters.role || undefined,
          status: filters.status || undefined,
          verified: filters.verified || undefined,
          page,
        },
      });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (field) => (e) => {
    setPage(1);
    setFilters({ ...filters, [field]: e.target.value });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters({ ...filters, q: input.trim() });
  };

  const act = async (user, path, body, confirmText) => {
        if (confirmText) {
      const ok = await confirm({
        title: "Suspend this user?",
        message: confirmText,
        confirmLabel: "Yes, suspend",
        cancelLabel: "No, keep active",
        danger: true,
      });
      if (!ok) return;
    }
    setBusyId(user._id);
    setError("");
    try {
      await api.patch(`/admin/users/${user._id}/${path}`, body);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="admin-filters">
        <form className="admin-search" onSubmit={submitSearch}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
          />
          <button className="btn btn-outline">Search</button>
        </form>
        <select className="admin-select" value={filters.role} onChange={setFilter("role")} aria-label="Filter by role">
          <option value="">Everyone</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
        <select className="admin-select" value={filters.status} onChange={setFilter("status")} aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="admin-select"
          value={filters.verified}
          onChange={setFilter("verified")}
          aria-label="Filter by verification"
        >
          <option value="">Any verification</option>
          <option value="true">Verified sellers</option>
          <option value="false">Not verified</option>
        </select>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="account-status">Loading...</p>}
      {!loading && !error && <p className="admin-count">{data.total} users</p>}

      <ul className="admin-list">
        {data.items.map((u) => {
          const isAdmin = u.roles.includes("admin");
          const busy = busyId === u._id;
          const profile = u.sellerProfile;

          return (
            <li key={u._id} className="admin-row">
              <div>
                <p className="admin-row-title">
                  {u.name}{" "}
                  {u.roles.map((r) => (
                    <span key={r} className={`role-badge role-${r}`}>
                      {ROLE_LABEL[r]}
                    </span>
                  ))}
                  {u.status === "suspended" && <span className="status-badge status-suspended">Suspended</span>}
                </p>
                <p className="admin-row-meta">
                  {u.email}
                  {u.phone ? ` · ${u.phone}` : ""} · Joined {formatDate(u.createdAt)}
                </p>
                {profile && (
                  <p className="admin-row-meta">
                    Shop: {profile.shopName} · {profile.region}
                    {profile.ratingCount > 0 ? ` · ${profile.ratingAvg} stars (${profile.ratingCount})` : ""} ·{" "}
                    {profile.verified ? "Verified" : "Not verified"}
                  </p>
                )}
              </div>

              <div className="admin-actions">
                {profile && !isAdmin && (
                  <button
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => act(u, "verify", { verified: !profile.verified })}
                  >
                    {profile.verified ? "Remove verification" : "Verify seller"}
                  </button>
                )}
                {!isAdmin &&
                  (u.status === "suspended" ? (
                    <button className="btn btn-primary" disabled={busy} onClick={() => act(u, "status", { status: "active" })}>
                      Reactivate
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline danger-btn"
                      disabled={busy}
                      onClick={() =>
                        act(
                          u,
                          "status",
                          { status: "suspended" },
                          `Suspend ${u.name}? They cannot log in, and their listings are hidden.`
                        )
                      }
                    >
                      Suspend
                    </button>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>

      <Pager page={page} pages={data.pages} onChange={setPage} />
    </>
  );
}