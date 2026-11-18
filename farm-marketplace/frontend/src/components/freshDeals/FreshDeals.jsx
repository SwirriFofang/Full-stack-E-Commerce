import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./FreshDeals.css";
import { assets } from "../../assets/assets";

// value = category stored in the database, image = file in frontend/public/categories/
const CARDS = {
  fruits: { value: "fruits", label: "Fresh fruits", image: assets.fruits, tint: "#FBE3C2" },
  vegetables: { value: "vegetables", label: "Vegetables", image: assets.vegetables, tint: "#D6EBCF" },
  eggs: { value: "dairy_eggs", label: "Eggs and dairy", image: assets.eggs, tint: "#FFF1C9" },
  spices: { value: "spices", label: "Spices", image: assets.spices, tint: "#F7D3CC" },
  tubers: { value: "tubers", label: "Tubers", image: assets.tubers, tint: "#EBD9C4" },
  grains: { value: "grains", label: "Grains", image: assets.grains, tint: "#F2E6B8" },
  legumes: { value: "legumes", label: "Beans and legumes", image: assets.legumes, tint: "#E7D5C3" },
  oils: { value: "oils", label: "Oils", image: assets.oils, tint: "#E3E8B8" },
  meat_fish: { value: "meat_fish", label: "Meat and fish", image: assets.meatFish, tint: "#D3E4F0" },
};

// direction 1 = moves up, -1 = moves down. The middle column goes the opposite way.
const COLUMNS = [
  { direction: 1, items: [CARDS.fruits, CARDS.spices, CARDS.grains] },
  { direction: -1, items: [CARDS.vegetables, CARDS.eggs, CARDS.tubers] },
  { direction: 1, items: [CARDS.legumes, CARDS.meat_fish, CARDS.oils] },
];

const SPEED = 22; // pixels per second: slow and calm

function DealCard({ item, hidden }) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      to={`/category/${item.value}`}
      className="deal-card"
      draggable={false}
      // The second copy of the list only exists to make the loop seamless
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <div className="deal-card-image" style={{ background: item.tint }}>
        <span className="deal-card-emoji" aria-hidden="true">
          {item.emoji}
        </span>
        {item.image && !failed && (
          <img src={item.image} alt="" loading="lazy" draggable={false} onError={() => setFailed(true)} />
        )}
      </div>
      <span className="deal-card-label">{item.label}</span>
    </Link>
  );
}

function DealColumn({ items, direction, playing }) {
  const ref = useRef(null);
  const pos = useRef(0); // exact scroll position (can have decimals)
  const paused = useRef(false);
  const timer = useRef(null);
  const drag = useRef(null);
  const justDragged = useRef(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  // The list is shown twice, so one full set is exactly half of the scroll height.
  // When we pass the halfway point we jump back by one set, and nobody sees the jump.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const half = () => el.scrollHeight / 2;
    pos.current = direction === 1 ? 0 : half() - 1;
    el.scrollTop = pos.current;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let frame;

    const tick = (now) => {
      const seconds = (now - last) / 1000;
      last = now;
      if (!paused.current && playingRef.current && !reduceMotion) {
        const h = half();
        pos.current += direction * SPEED * seconds;
        if (pos.current >= h) pos.current -= h;
        if (pos.current < 0) pos.current += h;
        el.scrollTop = pos.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer.current);
    };
  }, [direction]);

  const pause = () => {
    clearTimeout(timer.current);
    paused.current = true;
  };
  const resumeSoon = (delay = 400) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pos.current = ref.current.scrollTop; // continue from where the user left it
      paused.current = false;
    }, delay);
  };

  // Drag with the mouse to move the column yourself
  const onPointerDown = (e) => {
    if (e.pointerType === "touch") return;
    drag.current = { y: e.clientY, start: ref.current.scrollTop, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.buttons !== 1) return;
    if (Math.abs(e.clientY - d.y) > 5) d.moved = true;
    if (!d.moved) return;
    const el = ref.current;
    const h = el.scrollHeight / 2;
    const top = d.start - (e.clientY - d.y);
    el.scrollTop = ((top % h) + h) % h;
  };
  const onPointerUp = () => {
    if (drag.current?.moved) {
      justDragged.current = true;
      setTimeout(() => (justDragged.current = false), 0);
    }
    drag.current = null;
  };
  // A drag must not count as a click on the card underneath
  const onClickCapture = (e) => {
    if (justDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={ref}
      className="deal-column"
      onMouseEnter={pause}
      onMouseLeave={() => resumeSoon(400)}
      onFocus={pause}
      onBlur={() => resumeSoon(400)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {[...items, ...items].map((item, i) => (
        <DealCard key={`${item.value}-${i}`} item={item} hidden={i >= items.length} />
      ))}
    </div>
  );
}

export default function FreshDeals() {
  const [playing, setPlaying] = useState(true);

  return (
    <section className="fresh-deals">
      <div className="container">
        <div className="fresh-deals-head">
          <div>
            <h2>Fresh Deals</h2>
            <p>Pick a category and see what local farmers are selling today.</p>
          </div>
          <button className="btn btn-outline" onClick={() => setPlaying(!playing)}>
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        <div className="fresh-deals-grid">
          {COLUMNS.map((col, i) => (
            <DealColumn key={i} items={col.items} direction={col.direction} playing={playing} />
          ))}
        </div>
      </div>
    </section>
  );
}