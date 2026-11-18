import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { CONTACT, SITE_NAME, SOCIAL } from "../../utils/constants";
import "./Footer.css";

const svg = {
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

const InstagramIcon = () => (
  <svg {...svg}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17" cy="7" r="0.8" fill="currentColor" />
  </svg>
);
const FacebookIcon = () => (
  <svg {...svg} fill="currentColor" stroke="none">
    <path d="M14 8h2V5h-2.5C11.5 5 10 6.5 10 8.5V10H8v3h2v6h3v-6h2.2l.5-3H13V8.8c0-.5.3-.8 1-.8z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg {...svg}>
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg {...svg}>
    <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.1A8 8 0 1 0 12 4z" />
    <path d="M9.5 9c.4 2 2.5 4.1 4.5 4.5l1-1.1-1.6-1-.8.6c-.8-.4-1.5-1.1-1.9-1.9l.6-.8-1-1.6z" />
  </svg>
);
const PinIcon = () => (
  <svg {...svg}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const MailIcon = () => (
  <svg {...svg}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...svg}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

const digits = (value) => value.replace(/\D/g, "");

const SOCIAL_LINKS = [
  ["Instagram", SOCIAL.instagram, <InstagramIcon key="i" />, ""],
  ["Facebook", SOCIAL.facebook, <FacebookIcon key="f" />, ""],
  ["YouTube", SOCIAL.youtube, <YouTubeIcon key="y" />, "footer-social-accent"],
  ["WhatsApp", `https://wa.me/${digits(CONTACT.whatsapp)}`, <WhatsAppIcon key="w" />, ""],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-social">
          {SOCIAL_LINKS.map(([name, href, icon, extra]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={extra}
              aria-label={`${name} (opens in a new tab)`}
            >
              {icon}
            </a>
          ))}
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" aria-label={`${SITE_NAME} home`}>
              <img src={assets.logo} alt={SITE_NAME} />
            </Link>
            <p>
              {SITE_NAME} connects local farmers and traders with people who want fresh food. See the price, the
              quantity and the end time of every offer, then order in a few taps.
            </p>
          </div>

          <nav aria-label="Quick links">
            <h2>Quick Links</h2>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/#catalogue">Shop by category</Link>
              </li>
              <li>
                <Link to="/seller">Sell with us</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/cart">My basket</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2>Contact Us</h2>
            <address className="footer-contact">
              <p className="footer-contact-row">
                <PinIcon />
                <span>{CONTACT.address}</span>
              </p>
              <a className="footer-contact-row" href={`mailto:${CONTACT.email}`}>
                <MailIcon />
                <span>{CONTACT.email}</span>
              </a>
              <a className="footer-contact-row" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                <PhoneIcon />
                <span>{CONTACT.phone}</span>
              </a>
              <a
                className="footer-contact-row"
                href={`https://wa.me/${digits(CONTACT.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                <span>{CONTACT.whatsapp} (WhatsApp)</span>
              </a>
            </address>
          </div>

          <nav aria-label="Policies">
            <h2>Policies</h2>
            <ul>
              <li>
                <Link to="/shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms and conditions</Link>
              </li>
              <li>
                <Link to="/refunds">Refund Policy</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy notice</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </span>
          <span>Fresh food from local farms</span>
        </div>
      </div>
    </footer>
  );
}