import { useSearchParams } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import AdminOrders from "./AdminOrders";
import AdminCatalogue from "./AdminCatalogue";
import AdminUsers from "./AdminUsers";
import AdminListings from "./AdminListings";
import AdminReports from "./AdminReports";
import "../account/Account.css";
import "../seller/Seller.css";
import "./Admin.css";

const TABS = [
  ["overview", "Overview"],
  ["orders", "FarmFresh orders"],
  ["catalogue", "Catalogue"],
  ["users", "Users"],
  ["listings", "Seller listings"],
  ["reports", "Reports"],
];

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some(([value]) => value === requested) ? requested : "overview";

  // extra puts a filter in the address, for example { role: "seller" }
  const goTo = (value, extra = {}) => setParams({ tab: value, ...extra });

  return (
    <div className="container admin">
      <h1>Admin dashboard</h1>
      <p className="admin-sub">Manage the catalogue, people, listings and orders on FarmFresh.</p>

      <nav className="account-tabs" aria-label="Admin sections">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            className={`account-tab ${tab === value ? "account-tab-active" : ""}`}
            aria-current={tab === value ? "page" : undefined}
            onClick={() => goTo(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <AdminOverview goTo={goTo} />}
      {tab === "orders" && <AdminOrders />}
      {tab === "catalogue" && <AdminCatalogue />}
      {tab === "users" && <AdminUsers />}
      {tab === "listings" && <AdminListings />}
      {tab === "reports" && <AdminReports />}
    </div>
  );
}