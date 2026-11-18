import { useCart, lineKey } from "../../context/CartContext";
import "./AddToBasket.css";

const icon = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};
const PlusIcon = () => (
  <svg {...icon}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const MinusIcon = () => (
  <svg {...icon}>
    <path d="M5 12h14" />
  </svg>
);
const TrashIcon = () => (
  <svg {...icon}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);

export default function AddToBasket({ item, variant, disabled }) {
  const { items, add, setQuantity } = useCart();
  const line = items.find((i) => i.key === lineKey(item, variant));

  if (disabled) return <span className="add-unavailable">Not available</span>;

  if (line) {
    return (
      <div className="stepper" role="group" aria-label={`${item.name} quantity`}>
        <button
          className="stepper-minus"
          onClick={() => setQuantity(line.key, line.quantity - 1)}
          aria-label={line.quantity === 1 ? "Remove from basket" : "Remove one"}
        >
          {line.quantity === 1 ? <TrashIcon /> : <MinusIcon />}
        </button>
        <span className="stepper-count" aria-live="polite">
          {line.quantity}
        </span>
        <button
          className="stepper-plus"
          onClick={() => setQuantity(line.key, line.quantity + 1)}
          aria-label="Add one more"
        >
          <PlusIcon />
        </button>
      </div>
    );
  }

  return (
    <button className="add-button" onClick={() => add(item, variant)} aria-label={`Add ${item.name} to basket`}>
      <PlusIcon />
    </button>
  );
}