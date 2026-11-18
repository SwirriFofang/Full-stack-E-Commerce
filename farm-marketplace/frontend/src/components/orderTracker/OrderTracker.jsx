import "./OrderTracker.css";

const FLOW = {
  pickup: [
    ["pending", "Placed"],
    ["confirmed", "Confirmed"],
    ["packed", "Ready to collect"],
    ["delivered", "Collected"],
  ],
  delivery: [
    ["pending", "Placed"],
    ["confirmed", "Confirmed"],
    ["packed", "Packed"],
    ["out_for_delivery", "On the way"],
    ["delivered", "Delivered"],
  ],
};

export default function OrderTracker({ status, fulfilment }) {
  const steps = FLOW[fulfilment] || FLOW.pickup;
  const current = steps.findIndex(([value]) => value === status);

  return (
    <ol className="tracker" aria-label="Order progress">
      {steps.map(([value, label], i) => (
        <li
          key={value}
          className={i < current ? "done" : i === current ? "current" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          {label}
        </li>
      ))}
    </ol>
  );
}