import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrdersTab from "./OrdersTab";
import AddressesTab from "./AddressesTab";
import ReviewsTab from "./ReviewsTab";
import SettingsTab from "./SettingsTab";
import "./Account.css";

const TABS = [
  ["orders", "My orders"],
  ["addresses", "Saved addresses"],
  ["reviews", "My reviews"],
  ["settings", "Settings"]
];

export default function Account() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some(([value]) => value === requested) ? requested : "orders";

  return (
    <div className="container account">
      <h1>My account</h1>
      <p className="account-sub">
        {user.name} · {user.email}
      </p>

      <nav className="account-tabs" aria-label="Account sections">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            className={`account-tab ${tab === value ? "account-tab-active" : ""}`}
            aria-current={tab === value ? "page" : undefined}
            onClick={() => setParams({ tab: value })}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "orders" && <OrdersTab />}
      {tab === "addresses" && <AddressesTab />}
      {tab === "reviews" && <ReviewsTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}