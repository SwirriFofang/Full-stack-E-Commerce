import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/axios";
import { REGIONS, TOWNS_BY_REGION} from "../../utils/constants";
import FormField from "../../components/formField/FormField";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import OverviewTab from "./OverviewTab";
import ListingsTab from "./ListingsTab";
import SellerOrdersTab from "./SellerOrdersTab";
import "./Seller.css";

const TABS = [
  ["overview", "Overview"],
  ["listings", "My listings"],
  ["orders", "Orders"],
];

// Shown to logged-in users who are not sellers yet
function BecomeSeller() {
  const { becomeSeller } = useAuth();
  const [form, setForm] = useState({ shopName: "", region: "", town: "", bio: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const errors = compact({
    shopName: check.shopName(form.shopName),
    region: check.region(form.region),
    town: check.town(form.region, form.town),
    bio: form.bio.length > 500 ? "Keep it to 500 characters or fewer." : "",
  });
  const f = useFormErrors(errors, "seller");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setError("");
    setBusy(true);
    try {
      const body = { shopName: form.shopName.trim(), region: form.region, town: form.town };
      if (form.bio.trim()) body.bio = form.bio.trim();
      await becomeSeller(body); // the page switches to the dashboard by itself
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="form-page">
      <h1>Start selling on FarmFresh</h1>
      <p className="form-hint">Your account stays the same. You keep your orders and gain a seller dashboard.</p>
      <form className="form" onSubmit={submit} noValidate>
        <FormField label="Shop or farm name" id={f.id("shopName")} error={f.shown("shopName")}>
          {(p) => <input {...p} maxLength={80} value={form.shopName} onChange={set("shopName")} onBlur={f.touch("shopName")} />}
        </FormField>

        <FormField label="Region" id={f.id("region")} error={f.shown("region")}>
          {(p) => (
            <select {...p} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value, town: "" })} onBlur={f.touch("region")}>
              <option value="">Choose your region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Town" id={f.id("town")} error={f.shown("town")}>
          {(p) => (
            <select {...p} value={form.town} onChange={set("town")} onBlur={f.touch("town")} disabled={!form.region}>
              <option value="">{form.region ? "Choose your town" : "Choose a region first"}</option>
              {(TOWNS_BY_REGION[form.region] || []).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="About you (optional)" id={f.id("bio")} error={f.shown("bio")} count={`${form.bio.length}/500`}>
          {(p) => <textarea {...p} rows={3} maxLength={500} value={form.bio} onChange={set("bio")} onBlur={f.touch("bio")} />}
        </FormField>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Saving..." : "Become a seller"}
        </button>
      </form>
    </div>
  );
}

export default function Seller() {
  const { user, hasRole } = useAuth();
  const [params, setParams] = useSearchParams();

  if (!hasRole("seller")) return <BecomeSeller />;

  const requested = params.get("tab");
  const tab = TABS.some(([value]) => value === requested) ? requested : "overview";
  const goTo = (value) => setParams({ tab: value });
  const shop = user.sellerProfile?.shopName;

  return (
    <div className="container seller">
      <h1>Seller dashboard</h1>
      <p className="seller-sub">{shop}</p>

      <nav className="account-tabs" aria-label="Seller sections">
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

      {tab === "overview" && <OverviewTab goTo={goTo} />}
      {tab === "listings" && <ListingsTab />}
      {tab === "orders" && <SellerOrdersTab />}
    </div>
  );
}