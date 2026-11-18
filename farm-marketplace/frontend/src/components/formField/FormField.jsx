import "./FormField.css";

// children is a function that receives the props the control needs:
//   <FormField label="Email" id={f.id("email")} error={f.shown("email")}>
//     {(p) => <input {...p} value={...} onChange={...} />}
//   </FormField>
export default function FormField({ label, id, error, hint, count, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="ff">
      <div className="ff-top">
        <label htmlFor={id}>{label}</label>
        {count && <span className="ff-count">{count}</span>}
      </div>

      {children({ id, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy })}

      {error ? (
        <small id={`${id}-error`} className="ff-error" role="alert">
          {error}
        </small>
      ) : hint ? (
        <small id={`${id}-hint`} className="ff-hint">
          {hint}
        </small>
      ) : null}
    </div>
  );
}