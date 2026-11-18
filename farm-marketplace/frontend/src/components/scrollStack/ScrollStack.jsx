import { useEffect, useRef } from "react";
import "./ScrollStack.css";

// "under" stays pinned while the children (the next section) slide up and cover it
export default function ScrollStack({ id, under, children }) {
  const underRef = useRef(null);

  useEffect(() => {
    const el = underRef.current;
    if (!el) return;

    // A tall section pins when its BOTTOM reaches the bottom of the screen,
    // so every part of it can be scrolled through before it gets covered.
    const update = () => {
      el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
    };
    update();

    const observer = new ResizeObserver(update); // the catalogue changes height as items load
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div id={id} className="scroll-stack">
      <div ref={underRef} className="scroll-stack-under">
        {under}
      </div>
      <div className="scroll-stack-over">{children}</div>
    </div>
  );
}