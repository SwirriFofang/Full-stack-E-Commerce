import { REGIONS, TOWNS_BY_REGION } from "./constants";
import { isValidPhone } from "./phone";
import { isStrongPassword } from "./password";

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SHOP_PATTERN = /^[\p{L}\p{N}\s'’().,&-]+$/u;

// Each check returns a message, or "" when the value is fine
export const check = {
  name: (v) => {
    const s = v.trim();
    if (s.length < 2) return "Enter your full name (at least 2 characters).";
    if (s.length > 80) return "Keep your name to 80 characters or fewer.";
    if (!NAME_PATTERN.test(s)) return "Use letters only. Spaces and ' . - are also fine.";
    return "";
  },
  email: (v) => {
    const s = v.trim();
    if (!s) return "Enter your email address.";
    if (s.length > 120 || !EMAIL_PATTERN.test(s)) return "Enter a valid email, like name@example.com.";
    return "";
  },
  phone: (v, { required = false } = {}) => {
    if (!v.trim()) return required ? "Enter your phone number." : "";
    return isValidPhone(v) ? "" : "Enter a valid mobile number, for example 677 12 34 56.";
  },
  password: (v) => (isStrongPassword(v) ? "" : "Your password does not meet all the rules below."),
  confirm: (password, confirm) => {
    if (!confirm) return "Type your password again.";
    return password === confirm ? "" : "The two passwords do not match.";
  },
  shopName: (v) => {
    const s = v.trim();
    if (s.length < 2) return "Enter at least 2 characters.";
    if (s.length > 80) return "Keep it to 80 characters or fewer.";
    if (!SHOP_PATTERN.test(s)) return "Use letters, numbers and spaces. The marks . , ( ) & ' - are also allowed.";
    return "";
  },
  region: (v) => (REGIONS.includes(v) ? "" : "Choose a region."),
  town: (region, v) => {
    if (!region) return "Choose a region first.";
    return TOWNS_BY_REGION[region]?.includes(v) ? "" : "Choose a town from the list.";
  },
  label: (v) => {
    const s = v.trim();
    if (!s) return "Give the address a name, like Home or Work.";
    if (s.length > 30) return "Keep it to 30 characters or fewer.";
    if (!/^[\p{L}\p{N}\s'’.-]+$/u.test(s)) return "Use letters and numbers only.";
    return "";
  },
};

// Keeps only the fields that have a message
export const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));