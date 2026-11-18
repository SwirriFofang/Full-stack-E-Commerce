import { formatMoney, formatDate } from "../../utils/format";
import "./ListingCard.css";

const BADGES = {
  sold_out: { label: "Sold out", className: "badge-soldout" },
  expired: { label: "Expired", className: "badge-expired" },
};

export default function ListingCard({ listing }) {
  const badge = BADGES[listing.status];
  const shop = listing.seller?.sellerProfile?.shopName || listing.seller?.name;
  const inactive = listing.status !== "active";

  return (
    <article className={`listing-card ${inactive ? "listing-card-inactive" : ""}`}>
      <div className="listing-card-image">{listing.category.replace("_", " ")}</div>

      <div className="listing-card-body">
        <div className="listing-card-top">
          <h3 className="listing-card-title">{listing.title}</h3>
          {badge && <span className={`badge ${badge.className}`}>{badge.label}</span>}
        </div>

        <p className="listing-card-line">
          {listing.quantityAvailable} {listing.unit} available
        </p>
        <p className="listing-card-line">
          {listing.location.town ? `${listing.location.town}, ` : ""}
          {listing.location.region}
        </p>
        <p className="listing-card-price">
          {formatMoney(listing.price)} per {listing.unit}
        </p>
        <p className="listing-card-small">
          {listing.status === "expired" ? "Expired" : "Offer ends"} {formatDate(listing.expiresAt)}
        </p>
        <p className="listing-card-small">
          {shop}
          {listing.seller?.sellerProfile?.verified ? " · Verified" : ""}
        </p>
      </div>
    </article>
  );
}