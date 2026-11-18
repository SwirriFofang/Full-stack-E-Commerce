import { useEffect, useRef } from "react";
import { PAYMENT_METHODS } from "../../utils/constants";
import { formatMoney } from "../../utils/format";
import "./PaymentDone.css";

export default function PaymentDone({ orders, onClose, closeLabel = "Continue shopping", onViewOrders }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  const total = orders.reduce((sum, o) => sum + o.total, 0);
  const allPaid = orders.every((o) => o.paymentStatus === "paid");
  const method = PAYMENT_METHODS[orders[0]?.paymentMethod];

  return (
    <dialog
      ref={dialogRef}
      className="paydone"
      aria-labelledby="paydone-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className={`paydone-icon ${allPaid ? "" : "paydone-icon-warn"}`} aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {allPaid ? <path d="M5 13l4 4L19 7" /> : <path d="M12 6v7M12 17h.01" />}
        </svg>
      </div>

      <h2 id="paydone-title">{allPaid ? "Payment successful" : "Order placed"}</h2>
      <p className="paydone-text">
        {allPaid
          ? `Thank you! Your ${orders.length > 1 ? `${orders.length} orders are` : "order is"} confirmed${
              method ? ` and paid with ${method}` : ""
            }.`
          : "Your order was placed, but the payment did not go through. You can pay for it from your orders page."}
      </p>

      <ul className="paydone-orders">
        {orders.map((o) => (
          <li key={o._id}>
            <span>
              {o.soldBy === "platform" ? "FarmFresh" : "Seller order"}
              <small>{o.paymentStatus === "paid" ? ` · Ref ${o.paymentRef}` : " · Not paid"}</small>
            </span>
            <b>{formatMoney(o.total)}</b>
          </li>
        ))}
      </ul>

      <p className="paydone-total">
        <span>Total</span>
        <b>{formatMoney(total)}</b>
      </p>

      <div className="paydone-actions">
        {onViewOrders && (
          <button className="btn btn-outline btn-block" onClick={onViewOrders}>
            View my orders
          </button>
        )}
        <button className="btn btn-primary btn-block" onClick={onClose} autoFocus>
          {closeLabel}
        </button>
      </div>
    </dialog>
  );
}