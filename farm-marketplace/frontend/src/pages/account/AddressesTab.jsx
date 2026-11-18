import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import FormField from "../../components/formField/FormField";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import { REGIONS, TOWNS_BY_REGION } from "../../utils/constants";

const EMPTY = { label: "", region: "", town: "", details: "" };

function AddressForm({ onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const errors = compact({
    label: check.label(form.label),
    region: check.region(form.region),
    town: check.town(form.region, form.town),
    details: form.details.length > 200 ? "Keep it to 200 characters or fewer." : "",
  });
  const f = useFormErrors(errors, "addr");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setBusy(true);
    setError("");
    try {
      const body = { label: form.label.trim(), region: form.region, town: form.town };
      if (form.details.trim()) body.details = form.details.trim();
      const { data } = await api.post("/account/addresses", body);
      onSaved(data.addresses);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form className="form address-form" onSubmit={submit} noValidate>
      <h2>Add an address</h2>

      <FormField label="Name (for example Home or Work)" id={f.id("label")} error={f.shown("label")}>
        {(p) => <input {...p} maxLength={30} value={form.label} onChange={set("label")} onBlur={f.touch("label")} />}
      </FormField>

      <FormField label="Region" id={f.id("region")} error={f.shown("region")}>
        {(p) => (
          <select {...p} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value, town: "" })} onBlur={f.touch("region")}>
            <option value="">Choose a region</option>
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
            <option value="">{form.region ? "Choose a town" : "Choose a region first"}</option>
            {(TOWNS_BY_REGION[form.region] || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Street, landmark or directions (optional)" id={f.id("details")} error={f.shown("details")} count={`${form.details.length}/200`}>
        {(p) => <input {...p} maxLength={200} value={form.details} onChange={set("details")} onBlur={f.touch("details")} />}
      </FormField>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving..." : "Save address"}
      </button>
    </form>
  );
}

export default function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0); // a new key gives a fresh, empty form

  useEffect(() => {
    api
      .get("/account/addresses")
      .then((res) => setAddresses(res.data.addresses))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    setError("");
    try {
      const { data } = await api.delete(`/account/addresses/${id}`);
      setAddresses(data.addresses);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (loading) return <p className="account-status">Loading...</p>;

  return (
    <div className="addresses">
      <div>
        {addresses.length === 0 && <p className="account-status">You have no saved addresses yet.</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <ul className="address-list">
          {addresses.map((a) => (
            <li key={a._id} className="address">
              <div>
                <b>{a.label}</b>
                <p>{[a.details, a.town, a.region].filter(Boolean).join(", ")}</p>
              </div>
              <button className="link-danger" onClick={() => remove(a._id)} aria-label={`Delete ${a.label}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AddressForm
        key={formKey}
        onSaved={(list) => {
          setAddresses(list);
          setFormKey((k) => k + 1);
        }}
      />
    </div>
  );
}