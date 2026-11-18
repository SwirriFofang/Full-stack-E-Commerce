import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ReportDialog from "../reportDialog/ReportDialog";
import { useEffect, useRef, useState } from "react";
import AddToBasket from "../addToBasket/AddToBasket";
import { CATEGORIES, CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, formatDate, fileUrl } from "../../utils/format";
import "./ProductDetails.css";

export default function ProductDetails({ item, variant, onVariantChange, onClose }) {
  const dialogRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);

  const unavailable = item.status === "sold_out" || item.status === "expired";
  const seller = item.soldBy;
  const isSeller = seller.type === "seller";
  const { user } = useAuth();
  const [reporting, setReporting] = useState(false);
  // Sellers' listings only, and never your own
  const canReport = isSeller && seller.sellerId && String(user?.id) !== String(seller.sellerId);
  const categoryLabel = CATEGORIES.find(([value]) => value === item.category)?.[1];
  const titleId = `details-title-${item._id}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="details-dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="details">
        <button className="details-close" onClick={onClose} aria-label="Close details">
          ×
        </button>

        <div className="details-image">
          {item.image && !imageFailed ? (
            <img src={fileUrl(item.image)} alt={item.name} onError={() => setImageFailed(true)} />
          ) : (
            <span className="details-emoji" aria-hidden="true">
              {CATEGORY_EMOJI[item.category]}
            </span>
          )}
        </div>

        <div className="details-body">
          <p className="details-category">{categoryLabel}</p>
          <h2 id={titleId}>{item.name}</h2>
          {item.description && <p className="details-description">{item.description}</p>}

          {item.variants.length > 1 && (
            <label className="details-size">
              Size
              <select value={variant._id} onChange={(e) => onVariantChange(e.target.value)}>
                {item.variants.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <p className="details-price">
            {formatMoney(variant.price)} <span>/ {variant.label}</span>
          </p>

          <dl className="details-list">
            <dt>Sold by</dt>
            <dd>
              {seller.name}
              {seller.verified && isSeller && " (verified seller)"}
              {!isSeller && " (our own catalogue)"}
            </dd>

            {isSeller && seller.rating > 0 && (
              <>
                <dt>Rating</dt>
                <dd>{seller.rating.toFixed(1)} out of 5</dd>
              </>
            )}

            {item.location && (
              <>
                <dt>Location</dt>
                <dd>
                  {item.location.town ? `${item.location.town}, ` : ""}
                  {item.location.region}
                </dd>
              </>
            )}

            {item.quantityAvailable !== undefined && (
              <>
                <dt>Available</dt>
                <dd>
                  {item.quantityAvailable} {item.unit}
                </dd>
              </>
            )}

            {item.expiresAt && (
              <>
                <dt>{item.status === "expired" ? "Offer ended" : "Offer ends"}</dt>
                <dd>{formatDate(item.expiresAt)}</dd>
              </>
            )}

            {item.delivery && (
              <>
                <dt>Collection</dt>
                <dd>
                  {[
                    item.delivery.pickup && "Pickup",
                    item.delivery.delivery &&
                    `Delivery${item.delivery.fee ? ` (${formatMoney(item.delivery.fee)})` : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" or ") || "Ask the seller"}
                </dd>
              </>
            )}
          </dl>

          <div className="details-action">
            <AddToBasket item={item} variant={variant} disabled={unavailable} />
          </div>
                    {canReport && (
            <p className="details-report">
              {user ? (
                <button className="details-report-link" onClick={() => setReporting(true)}>
                  Report this listing
                </button>
              ) : (
                <Link to="/login">Log in to report this listing</Link>
              )}
            </p>
          )}
        </div>
      </div>
            {reporting && <ReportDialog item={item} onClose={() => setReporting(false)} />}
    </dialog>
  );
}