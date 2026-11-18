import { useEffect, useState } from "react";
import "./AnimatedArt.css";

// A silent, looping picture video that starts by itself
export default function AnimatedArt({ src, className = "" }) {
  const [failed, setFailed] = useState(false);
  const [still, setStill] = useState(false);

  // People who ask their device for less motion see the first frame instead
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!src || failed) return null;

  return (
    <video
      className={`animated-art ${className}`}
      src={src}
      autoPlay={!still}
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onError={() => setFailed(true)}
    />
  );
}