import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { formatMoney } from "../../utils/format";

export default function OverviewTab({ goTo }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/seller/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <p className="account-status">Loading...</p>;

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Active listings</span>
          <b>{stats.activeListings}</b>
        </div>
        <div className="stat">
          <span>New orders to confirm</span>
          <b>{stats.newOrders}</b>
        </div>
        <div className="stat">
          <span>Orders being prepared or delivered</span>
          <b>{stats.toDeliver}</b>
        </div>
        <div className="stat">
          <span>Earned this month</span>
          <b>{formatMoney(stats.monthEarnings)}</b>
        </div>
        <div className="stat">
          <span>Earned in total</span>
          <b>{formatMoney(stats.totalEarnings)}</b>
        </div>
        <div className="stat">
          <span>Sold out or expired</span>
          <b>{stats.soldOutListings + stats.expiredListings}</b>
        </div>
      </div>
      <p className="seller-note">Earnings count paid orders that were not cancelled, including delivery fees.</p>

      <div className="panels">
        <section className="panel">
          <h2>Running low</h2>
          {stats.lowStock.length === 0 ? (
            <p className="account-status">Nothing is running low.</p>
          ) : (
            <ul className="lowstock">
              {stats.lowStock.map((l) => (
                <li key={l._id}>
                  <span>{l.title}</span>
                  <b>
                    {l.quantityAvailable} {l.unit} left
                  </b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Quick actions</h2>
          <div className="panel-actions">
            <button className="btn btn-primary" onClick={() => goTo("listings")}>
              Add or manage listings
            </button>
            <button className="btn btn-outline" onClick={() => goTo("orders")}>
              View orders
            </button>
          </div>
        </section>
      </div>
    </>
  );
}