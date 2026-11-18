import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { CONTACT, SITE_NAME } from "../../utils/constants";
import "./FloatingActions.css";

const svg = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export default function FloatingActions() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const whatsapp = CONTACT.whatsapp.replace(/\D/g, ""); // empty until you set a real number
  const showBasket = pathname !== "/cart" && pathname !== "/checkout";

  return (
    <div className="floating">
      <button
        type="button"
        className={`floating-btn floating-top ${showTop ? "" : "floating-hidden"}`}
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <svg {...svg}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      {showBasket && (
        <Link
          to="/cart"
          className="floating-btn floating-basket"
          aria-label={`Basket, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <svg {...svg}>
            <path d="M5 9h14l-1.5 10a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 9z" />
            <path d="M9 9l3-5 3 5" />
          </svg>
          {count > 0 && <span className="floating-count">{count > 99 ? "99+" : count}</span>}
        </Link>
      )}

      {whatsapp && (
        <a
          className="floating-btn floating-whatsapp"
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello ${SITE_NAME}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in a new tab)"
        >
          <svg {...svg}>
            <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.1A8 8 0 1 0 12 4z" />
            <path d="M9.5 9c.4 2 2.5 4.1 4.5 4.5l1-1.1-1.6-1-.8.6c-.8-.4-1.5-1.1-1.9-1.9l.6-.8-1-1.6z" />
          </svg>
        </a>
      )}
    </div>
  );
}