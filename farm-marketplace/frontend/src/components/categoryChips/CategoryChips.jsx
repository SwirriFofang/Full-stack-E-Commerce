import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../../utils/constants";
import "./CategoryChips.css";

export default function CategoryChips({ active = "" }) {
  const [params] = useSearchParams();
  const region = params.get("region");
  const search = region ? `?region=${encodeURIComponent(region)}` : "";

  return (
    <nav className="category-chips" aria-label="Food categories">
      {[["", "All"], ...CATEGORIES].map(([value, label]) => (
        <Link
          key={value}
          to={{ pathname: value ? `/category/${value}` : "/", search, hash: value ? "" : "#catalogue" }}
          className={`category-chip ${active === value ? "category-chip-active" : ""}`}
          aria-current={active === value ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}