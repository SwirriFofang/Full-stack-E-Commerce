import { Link } from "react-router-dom";
import AnimatedArt from "../animatedArt/AnimatedArt";
import { assets } from "../../assets/assets";
import "./EmptyCart.css";

export default function EmptyCart() {
  return (
    <section className="empty-cart">
      <div className="empty-cart-art">
        <AnimatedArt src={assets.emptyCart} />
      </div>

      <h1>Your cart is empty</h1>
      <p>Let’s find something you’ll love</p>

      <Link to="/#catalogue" className="empty-cart-button">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        Continue Shopping
      </Link>
    </section>
  );
}