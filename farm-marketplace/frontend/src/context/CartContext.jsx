import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const MAX_QUANTITY = 99;

// The old single basket belonged to whoever used the browser last, so it is removed once
try {
  localStorage.removeItem("farmfresh_cart");
} catch {
  // storage may be blocked
}

const keyFor = (owner) => `farmfresh_cart:${owner}`;

function read(owner) {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(owner)));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function write(owner, items) {
  try {
    localStorage.setItem(keyFor(owner), JSON.stringify(items));
  } catch {
    // storage may be blocked; the basket still works until the page closes
  }
}

// One basket line per product and size
export const lineKey = (item, variant) => `${item.source}:${item._id}:${variant._id}`;

function merge(base, extra) {
  const lines = new Map(base.map((i) => [i.key, { ...i }]));
  for (const line of extra) {
    const same = lines.get(line.key);
    if (same) same.quantity = Math.min(same.quantity + line.quantity, MAX_QUANTITY);
    else lines.set(line.key, { ...line });
  }
  return [...lines.values()];
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth();

  // Whose basket this is: nobody yet (still checking the login), a guest, or a user's id
  const owner = loading ? null : user ? String(user.id) : "guest";

  const [state, setState] = useState({ owner: null, items: [] });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // When the person changes (log in, log out, another account), show the right basket
  useEffect(() => {
    if (owner === null) return;
    const previous = stateRef.current;
    if (previous.owner === owner) return;

    let next = read(owner);
    if (previous.owner === "guest" && owner !== "guest") {
      next = merge(next, previous.items); // a guest who logs in keeps what they picked
      write("guest", []);
    }
    setState({ owner, items: next });
  }, [owner]);

  // Save every change under the current person
  useEffect(() => {
    if (owner !== null && state.owner === owner) write(owner, state.items);
  }, [state, owner]);

  // Another person's basket is never shown, not even for a moment
  const items = state.owner === owner ? state.items : [];

  const update = (change) =>
    setState((prev) => (prev.owner === owner ? { ...prev, items: change(prev.items) } : prev));

  const add = (item, variant) =>
    update((prev) => {
      const key = lineKey(item, variant);
      if (prev.some((i) => i.key === key)) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i
        );
      }
      return [
        ...prev,
        {
          key,
          source: item.source,
          itemId: item._id,
          variantId: variant._id,
          name: item.name,
          image: item.image,
          category: item.category,
          label: variant.label,
          price: variant.price,
          quantity: 1,
        },
      ];
    });

  // Setting the quantity to 0 removes the line (the trash button)
  const setQuantity = (key, quantity) =>
    update((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i))
    );

  const clear = () => update(() => []);

  // The number of different foods, not the number of pieces
  const count = items.length;
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, count, total, add, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);