import ProductCard from "../productCard/ProductCard";
import { keyOf } from "../../hooks/useProducts";
import "./ProductList.css";

export default function ProductList({ items, total, loading, error, hasMore, onMore, emptyText }) {
  const shown = items.length;

  return (
    <>
      {loading && shown === 0 && <p className="product-list-status">Loading...</p>}
      {error && <p className="product-list-status product-list-error">{error}</p>}
      {!loading && !error && shown === 0 && <p className="product-list-status">{emptyText}</p>}

      <div className="product-list-grid">
        {items.map((item) => (
          <ProductCard key={keyOf(item)} item={item} />
        ))}
      </div>

      {shown > 0 && (
        <div className="product-list-more">
          <p aria-live="polite">
            Showing {shown} of {total}
          </p>
          {hasMore && (
            <button className="btn btn-outline" disabled={loading} onClick={onMore}>
              {loading ? "Loading..." : "Show more"}
            </button>
          )}
        </div>
      )}
    </>
  );
}