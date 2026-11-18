import { useState } from "react";
import AddToBasket from "../addToBasket/AddToBasket";
import ProductDetails from "../productDetails/ProductDetails";
import { CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, fileUrl } from "../../utils/format";
import "./ProductCard.css";

const BADGES = { sold_out: "Sold out", expired: "Expired" };

export default function ProductCard({ item }) {
  const [variantId, setVariantId] = useState(item.variants[0]._id);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const variant = item.variants.find((v) => v._id === variantId) || item.variants[0];
  const unavailable = item.status === "sold_out" || item.status === "expired";

  return (
    <article className={`product-card ${unavailable ? "product-card-unavailable" : ""}`}>
      <button
        className="product-card-open"
        onClick={() => setOpen(true)}
        aria-label={`View details for ${item.name}`}
      >
        <span className="product-card-image">
          {item.image && !imageFailed ? (
            <img src={fileUrl(item.image)} alt="" loading="lazy" onError={() => setImageFailed(true)} />
          ) : (
            <span className="product-card-emoji" aria-hidden="true">
              {CATEGORY_EMOJI[item.category]}
            </span>
          )}
          {BADGES[item.status] && <span className="product-card-badge">{BADGES[item.status]}</span>}
        </span>
        <span className="product-card-name">{item.name}</span>
      </button>

      {item.variants.length > 1 && (
        <select
          className="product-card-select"
          value={variant._id}
          onChange={(e) => setVariantId(e.target.value)}
          aria-label={`Choose a size for ${item.name}`}
        >
          {item.variants.map((v) => (
            <option key={v._id} value={v._id}>
              {v.label}
            </option>
          ))}
        </select>
      )}

      <p className="product-card-price">
        {formatMoney(variant.price)} <span>/ {variant.label}</span>
      </p>

      <div className="product-card-action">
        <AddToBasket item={item} variant={variant} disabled={unavailable} />
      </div>

      {open && (
        <ProductDetails
          item={item}
          variant={variant}
          onVariantChange={setVariantId}
          onClose={() => setOpen(false)}
        />
      )}
    </article>
  );
}