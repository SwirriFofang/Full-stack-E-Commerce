import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import "./UserMenu.css";

// Dark enough for white letters. Every user always gets the same color.
const COLORS = [
  "#1558C0", "#8E24AA", "#C2185B", "#D84315", "#00796B",
  "#5D4037", "#455A64", "#283593", "#C62828", "#2E7D32",
];

const colorFor = (seed) => {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  // Close with a click outside or the Esc key
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (Array.from(user.name.trim())[0] || "?").toUpperCase();
  const firstName = user.name.trim().split(/\s+/)[0];
  const background = colorFor(user.id);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
    toast("You have been logged out");
  };

  return (
    <div
      className="user-menu"
      ref={wrapRef}
      onBlur={(e) => {
        // Tabbing away from the menu closes it
        if (!wrapRef.current.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="user-avatar"
        style={{ background }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${firstName}`}
        onClick={() => setOpen(!open)}
      >
        {initial}
      </button>

      {open && (
        <div className="user-dropdown" tabIndex={-1}>
          <div className="user-dropdown-head">
            <span className="user-avatar user-avatar-big" style={{ background }} aria-hidden="true">
              {initial}
            </span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>

          <div role="menu" aria-label="Account">
            <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>
              My account
            </Link>
            <Link role="menuitem" to="/account?tab=settings" onClick={() => setOpen(false)}>
              Settings
            </Link>
            <button role="menuitem" type="button" className="user-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}