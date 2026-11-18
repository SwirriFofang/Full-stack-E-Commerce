import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  danger = false,
  onResult,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="confirm"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(e) => {
        e.preventDefault();
        onResult(false); // the Esc key counts as "no"
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-message">{message}</p>
      <div className="confirm-actions">
        {/* The safe choice has the focus when the popup opens */}
        <button className="btn btn-outline" onClick={() => onResult(false)} autoFocus>
          {cancelLabel}
        </button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={() => onResult(true)}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}