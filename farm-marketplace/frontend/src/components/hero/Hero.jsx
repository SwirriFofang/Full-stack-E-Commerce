import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./Hero.css";

const icon = {
  width: 38,
  height: 38,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

// The three round badges. Change the labels and links here.
const BLOBS = [
  {
    label: "Vegetables",
    to: "/category/vegetables",
    className: "hero-blob-yellow",
    icon: (
      <svg {...icon}>
        <path d="M5 19C5 10 11 5 20 5c0 9-5 14-13 14z" />
        <path d="M5 19L14 10" />
      </svg>
    ),
  },
  {
    label: "Fruits",
    to: "/category/fruits",
    className: "hero-blob-orange",
    icon: (
      <svg {...icon}>
        <path d="M12 8c-3-2-7 0-6 5 .7 4 3 7 6 6 3 1 5.3-2 6-6 1-5-3-7-6-5z" />
        <path d="M12 8c0-2 1-3 3-4" />
      </svg>
    ),
  },
  {
    label: "Tubers",
    to: "/category/tubers",
    className: "hero-blob-blue",
    icon: (
      <svg {...icon}>
        <ellipse cx="12" cy="12" rx="8" ry="6" transform="rotate(-20 12 12)" />
        <circle cx="9" cy="11" r="0.8" fill="currentColor" />
        <circle cx="13" cy="14" r="0.8" fill="currentColor" />
        <circle cx="15" cy="10" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-inner">
        {/* The colored shapes behind the card */}
        <div className="hero-decor" aria-hidden="true">
          <span className="hero-circle hero-circle-purple" />
          <span className="hero-circle hero-circle-pink" />
          <span className="hero-circle hero-circle-teal" />
          <span className="hero-leaf" />
        </div>

        <div className="hero-card">
          <div className="hero-card-bg" aria-hidden="true" />

          <div className="hero-text">
            <h1 id="hero-title">
              Fresh from local farms <span className="hero-h1-light">to your table</span>
            </h1>
            <p>Buy cassava, tomatoes and more straight from the farmers and traders who grow them.</p>
            <div className="hero-actions">
              <Link to="/#catalogue" className="hero-btn hero-btn-primary">
                Shop now
              </Link>
              <Link to="/seller" className="hero-btn hero-btn-outline">
                Sell your produce
              </Link>
            </div>
          </div>

          <nav className="hero-blobs" aria-label="Popular categories">
            {BLOBS.map((blob) => (
              <Link key={blob.label} to={blob.to} className={`hero-blob ${blob.className}`}>
                {blob.icon}
                <span>{blob.label}</span>
              </Link>
            ))}
          </nav>

          {assets.heroTray && (
            <img
              className="hero-tray"
              src={assets.heroTray}
              alt="A tray of fresh vegetables"
              fetchPriority="high"
            />
          )}
          {assets.heroBroccoli && (
            <img className="hero-broccoli" src={assets.heroBroccoli} alt="" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}