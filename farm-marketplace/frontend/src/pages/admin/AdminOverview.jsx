import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { formatMoney } from "../../utils/format";

export default function AdminOverview({ goTo }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <p className="account-status">Loading...</p>;

  const attention = [
    [stats.platformOrdersToHandle, "FarmFresh orders to handle", () => goTo("orders")],
    [stats.openReports, "Open reports to review", () => goTo("reports")],
    [stats.pendingSellers, "Sellers not verified yet", () => goTo("users", { role: "seller", verified: "false" })],
  ];

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Total paid sales</span>
          <b>{formatMoney(stats.totalSales)}</b>
        </div>
        <div className="stat">
          <span>Paid orders</span>
          <b>{stats.paidOrders}</b>
        </div>
        <div className="stat">
          <span>All orders</span>
          <b>{stats.orders}</b>
        </div>
        <div className="stat">
          <span>Users</span>
          <b>{stats.users}</b>
        </div>
        <div className="stat">
          <span>Sellers</span>
          <b>{stats.sellers}</b>
        </div>
        <div className="stat">
          <span>Active seller listings</span>
          <b>{stats.activeListings}</b>
        </div>
      </div>

      <section className="panel attention">
        <h2>Needs your attention</h2>
        <ul>
          {attention.map(([count, label, open]) => (
            <li key={label}>
              <span>
                <b className={count > 0 ? "attention-count attention-on" : "attention-count"}>{count}</b> {label}
              </span>
              <button className="btn btn-outline" onClick={open}>
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}