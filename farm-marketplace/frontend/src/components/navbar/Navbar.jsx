import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { CATEGORIES, REGIONS } from "../../utils/constants";
import { assets } from "../../assets/assets";
import UserMenu from "../userMenu/UserMenu";
import "./Navbar.css";

const LOCATION_SEEN_KEY = "farmfresh_location_seen";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const PinIcon = () => (
  <svg {...iconProps}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const SearchIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const BasketIcon = () => (
  <svg {...iconProps} width="26" height="26">
    <path d="M5 9h14l-1.5 10a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 9z" />
    <path d="M9 9l3-5 3 5" />
  </svg>
);
const ChevronIcon = () => (
  <svg {...iconProps} width="16" height="16">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const { count: basketCount } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [searchText, setSearchText] = useState(params.get("q") || "");
  const [openMenu, setOpenMenu] = useState(null); // "location", "category" or null

  const [locationSeen, setLocationSeen] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_SEEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const markLocationSeen = () => {
    setLocationSeen(true);
    try {
      localStorage.setItem(LOCATION_SEEN_KEY, "1");
    } catch {
      // storage may be blocked; the shake just stops for this visit
    }
  };

  const region = params.get("region");
  const onCategoryPage = pathname.startsWith("/category/");
  const activeCategory = onCategoryPage ? pathname.split("/")[2] : "";

  // Pick a location: stay on the category page if you are on one, otherwise go to the catalogue
  const pickRegion = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("region", value);
    else next.delete("region");
    navigate({
      pathname: onCategoryPage ? pathname : "/",
      search: next.toString(),
      hash: onCategoryPage ? "" : "#catalogue",
    });
    setOpenMenu(null);
  };

  // Pick a category: it opens that category's own page
  const goCategory = (value) => {
    const next = new URLSearchParams();
    if (region) next.set("region", region);
    navigate({
      pathname: value ? `/category/${value}` : "/",
      search: next.toString(),
      hash: value ? "" : "#catalogue",
    });
    setOpenMenu(null);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (region) next.set("region", region);
    if (searchText.trim()) next.set("q", searchText.trim());
    navigate({ pathname: "/", search: next.toString(), hash: "#catalogue" });
    setOpenMenu(null);
  };

  const toggle = (name) => setOpenMenu(openMenu === name ? null : name);

  

  return (
    <header className="navbar">
      <div className="navbar-strip">Fresh produce straight from local farmers</div>

      <div className="container navbar-main">
        <Link to="/" className="navbar-logo" aria-label="FarmFresh home">
          <img src={assets.logo} alt="FarmFresh" />
        </Link>

        <div className="nav-dropdown" onMouseLeave={() => setOpenMenu(null)}>
          <button
            className={`nav-location ${region || locationSeen ? "" : "nav-location-shake"}`}
            onClick={() => {
              toggle("location");
              markLocationSeen();
            }}
            aria-expanded={openMenu === "location"}
          >
            <PinIcon />
            <span>{region || "Choose your location"}</span>
          </button>
          {openMenu === "location" && (
            <ul className="nav-menu">
              <li>
                <button className={!region ? "is-selected" : ""} onClick={() => pickRegion("")}>
                  All regions
                </button>
              </li>
              {REGIONS.map((r) => (
                <li key={r}>
                  <button className={region === r ? "is-selected" : ""} onClick={() => pickRegion(r)}>
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="navbar-search" onSubmit={submitSearch}>
          <SearchIcon />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="What are you looking for today?"
            aria-label="Search food"
          />
          <button className="btn btn-primary">Search</button>
        </form>

        <div className="navbar-actions">
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/login" className="navbar-login">
              <UserIcon />
              <span>Login</span>
            </Link>
          )}

          <Link to="/cart" className="navbar-basket" aria-label={`Basket, ${basketCount} items`}>
            <BasketIcon />
            <span className="basket-count">{basketCount}</span>
          </Link>
        </div>
      </div>

      <nav className="container navbar-menu">
        <NavLink to="/" end>
          Home
        </NavLink>

        <div className="nav-dropdown" onMouseLeave={() => setOpenMenu(null)}>
          <button
            className="nav-menu-button"
            onClick={() => toggle("category")}
            aria-expanded={openMenu === "category"}
          >
            Shop by category <ChevronIcon />
          </button>
          {openMenu === "category" && (
            <ul className="nav-menu">
              <li>
                <button className={!activeCategory ? "is-selected" : ""} onClick={() => goCategory("")}>
                  All food
                </button>
              </li>
              {CATEGORIES.map(([value, label]) => (
                <li key={value}>
                  <button
                    className={activeCategory === value ? "is-selected" : ""}
                    onClick={() => goCategory(value)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/seller">{hasRole("seller") ? "Seller dashboard" : "Sell with us"}</NavLink>
        {hasRole("admin") && <NavLink to="/admin">Admin</NavLink>}
      </nav>
    </header>
  );
}