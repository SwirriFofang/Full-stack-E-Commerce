import { useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import FormField from "../../components/formField/FormField";
import PasswordInput from "../../components/passwordInput/PasswordInput";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import { cleanPhone } from "../../utils/phone";
import { PASSWORD_RULES } from "../../utils/password";

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const { toast } = useFeedback();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const errors = compact({ name: check.name(form.name), phone: check.phone(form.phone) });
  const f = useFormErrors(errors, "profile");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setBusy(true);
    setError("");
    try {
      const body = { name: form.name.trim() };
      if (form.phone.trim()) body.phone = cleanPhone(form.phone);
      const { data } = await api.patch("/account/profile", body);
      updateUser(data.user);
      toast("Saved Successfully");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form settings-box" onSubmit={submit} noValidate>
      <h2>Your details</h2>
      <FormField label="Full name" id={f.id("name")} error={f.shown("name")}>
        {(p) => <input {...p} maxLength={80} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={f.touch("name")} />}
      </FormField>
      <FormField label="Phone (optional)" id={f.id("phone")} error={f.shown("phone")} hint="A Cameroon mobile number, for example 677 12 34 56.">
        {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onBlur={f.touch("phone")} />}
      </FormField>
      <p className="settings-email">Email: {user.email} (it cannot be changed here)</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { toast } = useFeedback();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  const errors = compact({
    current: form.current ? "" : "Enter your current password.",
    next: check.password(form.next),
    confirm: check.confirm(form.next, form.confirm),
  });
  const f = useFormErrors(errors, `pw${formKey}`);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/account/password", { currentPassword: form.current, newPassword: form.next });
      toast("Password Changed Successfully");
      setForm({ current: "", next: "", confirm: "" });
      setFormKey((k) => k + 1); // clears the red messages
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form settings-box" onSubmit={submit} noValidate key={formKey}>
      <h2>Change password</h2>
      <PasswordInput label="Current password" id={f.id("current")} error={f.shown("current")} autoComplete="current-password" value={form.current} onChange={set("current")} onBlur={f.touch("current")} />
      <PasswordInput label="New password" id={f.id("next")} error={f.shown("next")} autoComplete="new-password" describedBy="new-password-rules" value={form.next} onChange={set("next")} onBlur={f.touch("next")} />
      <ul id="new-password-rules" className="password-rules">
        {PASSWORD_RULES.map(([text, test]) => {
          const ok = test(form.next);
          return (
            <li key={text} className={ok ? "met" : ""}>
              <span aria-hidden="true">{ok ? "✓" : "○"}</span>
              <span className="sr-only">{ok ? "Done: " : "Needed: "}</span>
              {text}
            </li>
          );
        })}
      </ul>
      <PasswordInput label="Confirm new password" id={f.id("confirm")} error={f.shown("confirm")} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} onBlur={f.touch("confirm")} />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}

export default function SettingsTab() {
  return (
    <div className="settings">
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}