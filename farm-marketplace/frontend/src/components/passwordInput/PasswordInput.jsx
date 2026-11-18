import { useId, useState } from "react";
import "../formField/FormField.css";
import "./PasswordInput.css";

const svg = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};
const EyeIcon = () => (
  <svg {...svg}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg {...svg}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

// Extra props (value, onChange, onBlur, autoComplete...) go to the input
export default function PasswordInput({ label, id: idProp, error, describedBy, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const id = idProp || autoId;
  const described = [describedBy, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="password-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={described}
          {...inputProps}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <small id={`${id}-error`} className="ff-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}