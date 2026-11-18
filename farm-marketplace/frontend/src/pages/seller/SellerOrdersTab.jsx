import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import OrderTracker from "../../components/orderTracker/OrderTracker";
import { formatMoney, formatDate } from "../../utils/format";
import { useFeedback } from "../../context/FeedbackContext";

const ACTIVE = ["pending", "confirmed", "packed", "out_for_delivery"];
const FILTERS = [
  ["todo", "To do", (o) => ACTIVE.includes(o.status)],
  ["done", "Completed", (o) => o.status === "delivered"],
  ["cancelled", "Cancelled", (o) => o.status === "cancelled"],
  ["all", "All", () => true],
];
const PAY_LABEL = { unpaid: "Not paid", paid: "Paid", refunded: "Refunded" };

// The one forward step the seller can take from each status
const nextStep = (order) => {
  switch (order.status) {
    case "pending":
      return ["confirmed", "Confirm order"];
    case "confirmed":
      return ["packed", "Mark as packed"];
    case "packed":
      return order.fulfilment === "delivery" ? ["out_for_delivery", "Send out for delivery"] : null;
    default:
      return null;
  }
};

const waitingNote = (order) => {
  if (order.fulfilment === "pickup" && order.status === "packed") {
    return "Ready for pickup. Waiting for the buyer to confirm they collected it.";
  }
  if (order.fulfilment === "delivery" && order.status === "out_for_delivery") {
    return "On the way. Waiting for the buyer to confirm they received it.";
  }
  return "";
};

export default function SellerOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("todo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const { confirm } = useFeedback();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/selling");
      setOrders(data.orders);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order, status) => {
    setBusyId(order._id);
    setError("");
    try {
      await api.patch(`/orders/${order._id}/status`, { status });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (order) => {
    const ok = await confirm({
      title: "Cancel this order?",
      message: "The food goes back on your listing, and the buyer will see the order as cancelled.",
      confirmLabel: "Yes, cancel order",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (ok) setStatus(order, "cancelled");
  };
  if (loading) return <p className="account-status">Loading orders...</p>;

  const test = FILTERS.find(([value]) => value === filter)[2];
  const shown = orders.filter(test);

  return (
    <>
      <div className="seller-chips seller-bar">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            className={`seller-chip ${filter === value ? "seller-chip-active" : ""}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {shown.length === 0 && <p className="account-status">No orders here.</p>}

      <ul className="orders">
        {shown.map((order) => {
          const step = nextStep(order);
          const busy = busyId === order._id;
          const canCancel = order.status === "pending" || order.status === "confirmed";

          return (
            <li key={order._id} className="order">
              <header className="order-head">
                <div>
                  <b>
                    {order.buyer?.name} · Order #{order._id.slice(-6)}
                  </b>
                  <span>Placed {formatDate(order.createdAt)}</span>

                  <span>
                    Contact: {order.contactName || order.buyer?.name} · {order.contactPhone || order.buyer?.phone}
                  </span>
                  {order.note && <span>Note: {order.note}</span>}

                </div>
                <span className={`pay-badge pay-${order.paymentStatus}`}>{PAY_LABEL[order.paymentStatus]}</span>
              </header>

              <p className="seller-collect">
                {order.fulfilment === "delivery"
                  ? `Deliver to: ${[order.address?.details, order.address?.town, order.address?.region]
                    .filter(Boolean)
                    .join(", ")}`
                  : "Customer will collect (pickup)"}
              </p>

              {waitingNote(order) && <p className="seller-collect">{waitingNote(order)}</p>}

              {order.status === "cancelled" ? (
                <p className="order-cancelled">This order was cancelled.</p>
              ) : (
                <OrderTracker status={order.status} fulfilment={order.fulfilment} />
              )}

              <ul className="order-items">
                {order.items.map((item, i) => (
                  <li key={`${item.title}-${i}`}>
                    <span>
                      {item.quantity} × {item.title} <small>{item.unit}</small>
                    </span>
                    <b>{formatMoney(item.unitPrice * item.quantity)}</b>
                  </li>
                ))}
                {order.deliveryFee > 0 && (
                  <li>
                    <span>Delivery fee</span>
                    <b>{formatMoney(order.deliveryFee)}</b>
                  </li>
                )}
              </ul>

              <footer className="order-foot">
                <p className="order-total">
                  Total <b>{formatMoney(order.total)}</b>
                </p>
                <div className="order-actions">
                  {step && (
                    <button className="btn btn-primary" disabled={busy} onClick={() => setStatus(order, step[0])}>
                      {step[1]}
                    </button>
                  )}
                  {canCancel && (
                    <button className="btn btn-outline" disabled={busy} onClick={() => cancel(order)}>
                      Cancel order
                    </button>
                  )}
                </div>
              </footer>
            </li>
          );
        })}
      </ul>
    </>
  );
}