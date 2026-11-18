import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/axios";
import FormField from "../../components/formField/FormField";
import PasswordInput from "../../components/passwordInput/PasswordInput";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import { cleanPhone } from "../../utils/phone";
import { PASSWORD_RULES } from "../../utils/password";
import { REGIONS, TOWNS_BY_REGION } from "../../utils/constants";
import "./Register.css";

const EMPTY = { name: "",
   email: "", 
   phone: "", 
   password: "", 
   confirm: "", 
   shopName: "", 
   region: "",
   town: "" 
  };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("buyer");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSeller = accountType === "seller";
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setRegion = (e) => setForm({ ...form, region: e.target.value, town: "" });

  // In the same order as the form
  const errors = compact({
    name: check.name(form.name),
    email: check.email(form.email),
    phone: check.phone(form.phone),
    shopName: isSeller ? check.shopName(form.shopName) : "",
    region: isSeller ? check.region(form.region) : "",
    town: isSeller ? check.town(form.region, form.town) : "",
    password: check.password(form.password),
    confirm: check.confirm(form.password, form.confirm),
  });
  const f = useFormErrors(errors, "reg");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setError("");
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        accountType,
      };
      if (form.phone.trim()) payload.phone = cleanPhone(form.phone);
      if (isSeller) {
        payload.shopName = form.shopName.trim();
        payload.region = form.region;
        payload.town = form.town;
      }
      await register(payload);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-page">
      <h1>Create your account</h1>

      <form className="form" onSubmit={submit} noValidate>
        <fieldset className="type-choices">
          <legend>I want to</legend>
          <label className="type-choice">
            <input type="radio" name="accountType" value="buyer" checked={!isSeller} onChange={() => setAccountType("buyer")} />
            <span>
              <b>Buy food</b>
              <small>Browse, order and pay. Choose this if you are a customer.</small>
            </span>
          </label>
          <label className="type-choice">
            <input type="radio" name="accountType" value="seller" checked={isSeller} onChange={() => setAccountType("seller")} />
            <span>
              <b>Sell food</b>
              <small>List your produce for sale. You can still buy with the same account.</small>
            </span>
          </label>
        </fieldset>

        <FormField label="Full name" id={f.id("name")} error={f.shown("name")}>
          {(p) => <input {...p} maxLength={80} autoComplete="name" value={form.name} onChange={set("name")} onBlur={f.touch("name")} />}
        </FormField>

        <FormField label="Email" id={f.id("email")} error={f.shown("email")}>
          {(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set("email")} onBlur={f.touch("email")} />}
        </FormField>

        <FormField label="Phone (optional)" id={f.id("phone")} error={f.shown("phone")} hint="A Cameroon mobile number, for example 677 12 34 56.">
          {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} onBlur={f.touch("phone")} />}
        </FormField>

        {isSeller && (
          <>
            <FormField label="Shop or farm name" id={f.id("shopName")} error={f.shown("shopName")}>
              {(p) => <input {...p} maxLength={80} value={form.shopName} onChange={set("shopName")} onBlur={f.touch("shopName")} />}
            </FormField>

            <FormField label="Region" id={f.id("region")} error={f.shown("region")}>
              {(p) => (
                <select {...p} value={form.region} onChange={setRegion} onBlur={f.touch("region")}>
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
          </>
        )}

        <PasswordInput
          label="Password"
          id={f.id("password")}
          error={f.shown("password")}
          autoComplete="new-password"
          describedBy="password-rules"
          value={form.password}
          onChange={set("password")}
          onBlur={f.touch("password")}
        />
        <ul id="password-rules" className="password-rules">
          {PASSWORD_RULES.map(([text, test]) => {
            const ok = test(form.password);
            return (
              <li key={text} className={ok ? "met" : ""}>
                <span aria-hidden="true">{ok ? "✓" : "○"}</span>
                <span className="sr-only">{ok ? "Done: " : "Needed: "}</span>
                {text}
              </li>
            );
          })}
        </ul>

        <PasswordInput
          label="Confirm password"
          id={f.id("confirm")}
          error={f.shown("confirm")}
          autoComplete="new-password"
          value={form.confirm}
          onChange={set("confirm")}
          onBlur={f.touch("confirm")}
        />
        <p className="confirm-help ok" aria-live="polite">
          {form.confirm && !errors.confirm ? "Passwords match" : ""}
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating account..." : isSeller ? "Create seller account" : "Create account"}
        </button>
      </form>

      <p className="form-hint">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}