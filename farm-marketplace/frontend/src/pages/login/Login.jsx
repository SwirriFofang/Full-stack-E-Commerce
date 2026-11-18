import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/axios";
import FormField from "../../components/formField/FormField";
import PasswordInput from "../../components/passwordInput/PasswordInput";
import AnimatedArt from "../../components/animatedArt/AnimatedArt";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import { assets } from "../../assets/assets";
import { SITE_NAME } from "../../utils/constants";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const errors = compact({
    email: check.email(form.email),
    password: form.password ? "" : "Enter your password.",
  });
  const f = useFormErrors(errors, "login");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.validate()) return;
    setError("");
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-side">
        <div className="login-box">
          <Link to="/" className="login-logo" aria-label={`${SITE_NAME} home`}>
            <img src={assets.logo} alt={SITE_NAME} />
          </Link>

          <h1>Sign in to your account</h1>

          <form className="form" onSubmit={submit} noValidate>
            <FormField label="Email" id={f.id("email")} error={f.shown("email")}>
              {(p) => (
                <input
                  {...p}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={f.touch("email")}
                />
              )}
            </FormField>
            <PasswordInput
              label="Password"
              id={f.id("password")}
              error={f.shown("password")}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={f.touch("password")}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="login-signup">
            No account? <Link to="/register">Sign up</Link>
          </p>

          <p className="login-terms">
            By continuing, I agree to {SITE_NAME}’s <Link to="/terms">terms &amp; conditions</Link> and{" "}
            <Link to="/privacy">privacy notice</Link>.
          </p>

          <Link to="/" className="login-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8l-4 4 4 4M8 12h8" />
            </svg>
            Back
          </Link>
        </div>
      </div>

      <div className="login-art" aria-hidden="true">
        <AnimatedArt src={assets.loginArt} />
      </div>
    </div>
  );
}