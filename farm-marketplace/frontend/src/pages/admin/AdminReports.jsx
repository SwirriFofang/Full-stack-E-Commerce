import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import Pager from "../../components/pager/Pager";
import { formatDate } from "../../utils/format";

const REASONS = {
  not_food: "Not food",
  fake_or_scam: "Fake or scam",
  wrong_info: "Wrong information",
  abusive: "Abusive",
  other: "Other",
};
const STATUSES = [
  ["open", "Open"],
  ["resolved", "Resolved"],
  ["dismissed", "Dismissed"],
];

function ReportCard({ report, onDone }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const target = report.target;
  const canRemove = report.targetType === "listing" && target && target.status !== "archived";

  const resolve = async (status, removeTarget = false) => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/admin/reports/${report._id}`, {
        status,
        adminNote: note.trim() || undefined,
        removeTarget,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <li className="admin-row report">
      <div>
        <p className="admin-row-title">
          {REASONS[report.reason]}
          <span className="role-badge role-customer">{report.targetType === "listing" ? "Listing" : "User"}</span>
        </p>

        <p className="admin-row-meta">
          {!target && "The reported item no longer exists."}
          {target?.kind === "listing" &&
            `Listing: ${target.title} (by ${target.sellerName}) · currently ${target.status}`}
          {target?.kind === "user" && `User: ${target.name} (${target.email}) · ${target.status}`}
        </p>
        {report.details && <p className="report-details">“{report.details}”</p>}
        <p className="admin-row-meta">
          Reported by {report.reporter?.name} ({report.reporter?.email}) · {formatDate(report.createdAt)}
        </p>
        {report.adminNote && <p className="admin-row-meta">Your note: {report.adminNote}</p>}

        {report.status === "open" && (
          <>
            <label className="report-note">
              Note (optional)
              <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            {report.targetType === "user" && target && (
              <p className="admin-row-meta">To suspend this user, open the Users tab.</p>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-actions report-actions">
              {canRemove && (
                <button className="btn btn-primary" disabled={busy} onClick={() => resolve("resolved", true)}>
                  Remove listing and resolve
                </button>
              )}
              <button className="btn btn-outline" disabled={busy} onClick={() => resolve("resolved")}>
                Mark resolved
              </button>
              <button className="btn btn-outline" disabled={busy} onClick={() => resolve("dismissed")}>
                Dismiss
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function AdminReports() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/admin/reports", { params: { status, page } });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const pickStatus = (value) => {
    setPage(1);
    setStatus(value);
  };

  return (
    <>
      <div className="seller-chips seller-bar">
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            className={`seller-chip ${status === value ? "seller-chip-active" : ""}`}
            onClick={() => pickStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="account-status">Loading...</p>}
      {!loading && !error && data.items.length === 0 && <p className="account-status">No {status} reports.</p>}

      <ul className="admin-list">
        {data.items.map((r) => (
          <ReportCard key={r._id} report={r} onDone={load} />
        ))}
      </ul>

      <Pager page={page} pages={data.pages} onChange={setPage} />
    </>
  );
}