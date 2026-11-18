import { useEffect, useRef, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import "./ReviewDialog.css";

export default function ReviewDialog({ order, onClose, onDone }) {
  const dialogRef = useRef(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const shop = order.seller?.sellerProfile?.shopName || order.seller?.name || "the seller";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a rating from 1 to 5 stars.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/reviews", {
        orderId: order._id,
        rating,
        comment: comment.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="review-dialog"
      aria-labelledby="review-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={submit}>
        <h2 id="review-title">Review {shop}</h2>

        <fieldset className="stars">
          <legend>Your rating</legend>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= rating ? "star star-on" : "star"}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
              <span aria-hidden="true">★</span>
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}
              </span>
            </label>
          ))}
        </fieldset>

        <label className="review-comment">
          Comment (optional)
          <textarea
            rows={4}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Was the food fresh? Was the seller on time?"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="review-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Sending..." : "Send review"}
          </button>
        </div>
      </form>
    </dialog>
  );
}