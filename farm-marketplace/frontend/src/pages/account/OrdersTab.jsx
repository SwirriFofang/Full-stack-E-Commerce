import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import OrderTracker from "../../components/orderTracker/OrderTracker";
import ReviewDialog from "../../components/reviewDialog/ReviewDialog";
import PaymentDone from "../../components/paymentDone/PaymentDone";
import { formatMoney, formatDate } from "../../utils/format";
import { useFeedback } from "../../context/FeedbackContext";

const PAY_LABEL = { unpaid: "Not paid", paid: "Paid", refunded: "Refunded" };

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reviewing, setReviewing] = useState(null); // the order being reviewed
  const [paid, setPaid] = useState(null); // shows the "Payment done" popup

  const { confirm } = useFeedback();
  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/mine");
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

  const act = async (order, path, after) => {
    setBusyId(order._id);
    setError("");
    try {
      const res = await api.post(`/orders/${order._id}/${path}`);
      await load();
      after?.(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const pay = (order) => act(order, "pay", (data) => setPaid([data.order]));

  const cancel = async (order) => {
    const ok = await confirm({
      title: "Cancel this order?",
      message: "If you already paid, the order is marked as refunded.",
      confirmLabel: "Yes, cancel order",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (ok) act(order, "cancel");
  };

  // The buyer can confirm once the seller has packed (pickup) or sent (delivery) the order
  const canConfirm = (order) =>
    (order.fulfilment === "pickup" && order.status === "packed") ||
    (order.fulfilment === "delivery" && order.status === "out_for_delivery");

  const received = async (order) => {
    const pickup = order.fulfilment === "pickup";
    const ok = await confirm({
      title: pickup ? "Have you collected your order?" : "Have you received your order?",
      message: "Only confirm once the food is in your hands. After that you can leave a review if you like.",
      confirmLabel: pickup ? "Yes, I collected it" : "Yes, I received it",
      cancelLabel: "Not yet",
    });
    if (ok) act(order, "received", () => toast("Thank you! You can now leave a review if you like."));
  };

  if (loading) return <p className="account-status">Loading your orders...</p>;

  if (!error && orders.length === 0) {
    return (
      <div className="account-empty">
        <p>You have not placed any orders yet.</p>
        <Link to="/#catalogue" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <ul className="orders">
        {orders.map((order) => {
          const seller = order.seller?.sellerProfile?.shopName || order.seller?.name;
          const busy = busyId === order._id;
          const canPay = order.paymentStatus === "unpaid" && order.status !== "cancelled";
          const canCancel = order.status === "pending";
          const canReview = order.status === "delivered" && order.soldBy === "seller" && !order.reviewed;

          return (
            <li key={order._id} className="order">
              <header className="order-head">
                <div>
                  <b>
                    {order.soldBy === "platform" ? "FarmFresh" : seller} · Order #{order._id.slice(-6)}
                  </b>
                  <span>Placed {formatDate(order.createdAt)}</span>
                </div>
                <span className={`pay-badge pay-${order.paymentStatus}`}>{PAY_LABEL[order.paymentStatus]}</span>
              </header>

              {order.status === "cancelled" ? (
                <p className="order-cancelled">This order was cancelled.</p>
              ) : (
                <OrderTracker status={order.status} fulfilment={order.fulfilment} />
              )}

              <ul className="order-items">
                {order.items.map((item, i) => (
                  <li key={`${item.title}-${item.unit}-${i}`}>
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
                  {canConfirm(order) && (
                    <button className="btn btn-primary" disabled={busy} onClick={() => received(order)}>
                      {order.fulfilment === "pickup" ? "I have collected it" : "I have received it"}
                    </button>
                  )}
                  {canPay && (
                    <button className="btn btn-primary" disabled={busy} onClick={() => pay(order)}>
                      Pay now
                    </button>
                  )}
                  {canCancel && (
                    <button className="btn btn-outline" disabled={busy} onClick={() => cancel(order)}>
                      Cancel order
                    </button>
                  )}
                  {canReview && (
                    <button className="btn btn-primary" onClick={() => setReviewing(order)}>
                      Leave a review
                    </button>
                  )}
                  {order.reviewed && <span className="order-reviewed">Reviewed</span>}
                </div>
              </footer>
            </li>
          );
        })}
      </ul>

      {reviewing && (
        <ReviewDialog
          order={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            load();
          }}
        />
      )}

      {paid && <PaymentDone orders={paid} closeLabel="Close" onClose={() => setPaid(null)} />}
    </>
  );
}