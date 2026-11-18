import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, fileUrl } from "../../utils/format";
import EmptyCart from "../../components/emptyCart/EmptyCart";
import "./Cart.css";

export default function Cart() {
  const { items, count, total, setQuantity, clear } = useCart();
  const { user } = useAuth();

    if (items.length === 0) return <EmptyCart />;

  return (
    <div className="container cart">
      <h1>Your basket</h1>

      <div className="cart-layout">
        <ul className="cart-lines">
          {items.map((line) => (
            <li key={line.key} className="cart-line">
              <div className="cart-line-image">
                {line.image ? (
                  <img src={fileUrl(line.image)} alt="" />
                ) : (
                  <span aria-hidden="true">{CATEGORY_EMOJI[line.category]}</span>
                )}
              </div>

              <div className="cart-line-info">
                <p className="cart-line-name">{line.name}</p>
                <p className="cart-line-meta">
                  {line.label} · {formatMoney(line.price)} each
                </p>
                <button className="cart-remove" onClick={() => setQuantity(line.key, 0)}>
                  Remove
                </button>
              </div>

              <div className="qty" role="group" aria-label={`${line.name} quantity`}>
                <button onClick={() => setQuantity(line.key, line.quantity - 1)} aria-label="Remove one">
                  −
                </button>
                <span aria-live="polite">{line.quantity}</span>
                <button onClick={() => setQuantity(line.key, line.quantity + 1)} aria-label="Add one more">
                  +
                </button>
              </div>

              <p className="cart-line-total">{formatMoney(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <p className="cart-summary-row">
            <span>Items ({count})</span>
            <b>{formatMoney(total)}</b>
          </p>
          <p className="cart-summary-note">Delivery fees, if any, are added at checkout.</p>

          <Link to="/checkout" className="btn btn-primary btn-block">
            Go to checkout
          </Link>
          {!user && <p className="cart-summary-note">You will be asked to log in or create an account.</p>}

          <button className="cart-clear" onClick={clear}>
            Empty basket
          </button>
        </aside>
      </div>
    </div>
  );
}