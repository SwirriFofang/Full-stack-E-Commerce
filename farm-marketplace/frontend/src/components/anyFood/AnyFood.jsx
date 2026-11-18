import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./AnyFood.css";

const TILES = [
  { label: "Vegetables", category: "vegetables", src: assets.vegetables, emoji: "🥬", big: true },
  { label: "Fruits", category: "fruits", src: assets.fruits, emoji: "🍊" },
  { label: "Eggs and dairy", category: "dairy_eggs", src: assets.eggs, emoji: "🥚" },
  { label: "Spices", category: "spices", src: assets.spices, emoji: "🌶️" },
  { label: "Tubers", category: "tubers", src: assets.tubers, emoji: "🍠" },
];

const BENEFITS = [
  [
    "Straight from the farm",
    "Buy from the farmers and traders who grew it. Every listing shows who is selling, where they are and how much is left.",
  ],
  [
    "Always fresh, never stale",
    "Every offer has an end time. Ended offers are marked Expired and disappear after 24 hours, so old stock never lingers.",
  ],
  [
    "Pay the way you prefer",
    "Choose MTN Mobile Money, Orange Money or bank transfer at checkout, then pick up your food or have it delivered.",
  ],
  [
    "Sell what you grow",
    "Farmers and traders can list their produce in minutes, set the price and the end time, and manage orders from one dashboard.",
  ],
];

export default function AnyFood() {
  return (
    <section className="any-food" aria-labelledby="any-food-title">
      <div className="container">
        <h2 id="any-food-title">Any food stuff you want to buy, you can</h2>
        <p className="any-food-lead">
          From cassava and tomatoes to eggs, spices and fresh vegetables, local farmers and traders list what they
          have today. You see the price, the quantity and when each offer ends, then order in a few taps.
        </p>

        <div className="food-panel">
          <div className="food-grid">
            {TILES.map((t) => (
              <Link
                key={t.category}
                to={`/?category=${t.category}#catalogue`}
                className={`food-tile ${t.big ? "food-tile-big" : ""}`}
              >
                <span className="food-tile-emoji" aria-hidden="true">
                  {t.emoji}
                </span>
                {t.src && (
                  <img
                    src={t.src}
                    alt=""
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <span className="food-tile-label">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <ul className="food-benefits">
          {BENEFITS.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>

        <div className="food-cta">
          <Link to="/#catalogue" className="food-btn food-btn-primary">
            Browse the catalogue
          </Link>
          <Link to="/seller" className="food-btn food-btn-outline">
            Start selling
          </Link>
        </div>
      </div>
    </section>
  );
}