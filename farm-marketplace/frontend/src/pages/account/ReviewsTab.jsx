import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { formatDate } from "../../utils/format";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/reviews/mine")
      .then((res) => setReviews(res.data.reviews))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="account-status">Loading...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (reviews.length === 0) {
    return (
      <p className="account-status">
        You have not written any reviews. After an order is delivered, you can review it from My orders.
      </p>
    );
  }

  return (
    <ul className="reviews">
      {reviews.map((r) => (
        <li key={r._id} className="review">
          <div className="review-top">
            <b>{r.seller?.sellerProfile?.shopName || r.seller?.name}</b>
            <span className="review-stars" aria-label={`${r.rating} out of 5 stars`}>
              {"★".repeat(r.rating)}
              <span className="review-stars-off">{"★".repeat(5 - r.rating)}</span>
            </span>
          </div>
          {r.comment && <p>{r.comment}</p>}
          <small>{formatDate(r.createdAt)}</small>
        </li>
      ))}
    </ul>
  );
}