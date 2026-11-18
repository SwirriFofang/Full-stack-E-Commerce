import { useEffect, useRef, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import "./ReportDialog.css";

const REASONS = [
  ["not_food", "This is not food"],
  ["fake_or_scam", "It looks fake or like a scam"],
  ["wrong_info", "Wrong price or information"],
  ["abusive", "Abusive or offensive"],
  ["other", "Something else"],
];

export default function ReportDialog({ item, onClose }) {
  const dialogRef = useRef(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = { targetType: "listing", targetId: item._id, reason };
      if (details.trim()) body.details = details.trim();
      await api.post("/reports", body);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="report-dialog"
      aria-labelledby="report-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {sent ? (
        <div className="report-sent">
          <h2 id="report-title">Report sent</h2>
          <p>Thank you. Our team will look at this listing.</p>
          <button className="btn btn-primary btn-block" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <h2 id="report-title">Report this listing</h2>
          <p className="report-item">{item.name}</p>

          <fieldset className="report-reasons">
            <legend>What is wrong with it?</legend>
            {REASONS.map(([value, label]) => (
              <label key={value} className="report-reason">
                <input
                  type="radio"
                  name="reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <label className="report-details-field">
            More details (optional)
            <textarea rows={3} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="report-buttons">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending..." : "Send report"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}