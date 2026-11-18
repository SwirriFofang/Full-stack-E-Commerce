import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import useProducts, { keyOf } from "../../hooks/useProducts";
import ProductCard from "../productCard/ProductCard";
import ProductList from "../productList/ProductList";
import CategoryChips from "../categoryChips/CategoryChips";
import "./CatalogueSection.css";

// Mixes the groups together: the first item of every category,
// then the second of every category, and so on
function blend(groups) {
  const longest = Math.max(...groups.map((g) => g.items.length));
  const mixed = [];
  for (let i = 0; i < longest; i++) {
    for (const group of groups) {
      if (group.items[i]) mixed.push(group.items[i]);
    }
  }
  return mixed;
}

// "All": the first three items of every category, blended into one set
function CategoryPreviews({ region }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/products/preview", { params: { region: region || undefined, perCategory: 3 } })
      .then((res) => !cancelled && setGroups(res.data.groups))
      .catch(() => !cancelled && setError("Could not load the catalogue"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [region]);

  if (error) return <p className="catalogue-status catalogue-error">{error}</p>;
  if (loading && groups.length === 0) return <p className="catalogue-status">Loading...</p>;
  if (groups.length === 0) return <p className="catalogue-status">Nothing here yet. Check back soon.</p>;

  return (
    <div className="catalogue-blend">
      {blend(groups).map((item) => (
        <div key={keyOf(item)} className="catalogue-blend-item">
          <ProductCard item={item} />
        </div>
      ))}
    </div>
  );
}

// A search: a flat list of results
function SearchResults({ q, region }) {
  const list = useProducts({ q, region });
  return (
    <ProductList
      items={list.items}
      total={list.total}
      loading={list.loading}
      error={list.error}
      hasMore={list.hasMore}
      onMore={list.loadMore}
      emptyText="Nothing found. Try another search."
    />
  );
}

export default function CatalogueSection() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const region = params.get("region") || "";
  const searching = q !== "";

  const clearFilters = () => setParams(new URLSearchParams());

  return (
    <section className="container catalogue">
      <h2 className="catalogue-title">{searching ? "Search results" : "Our catalogue"}</h2>

      <CategoryChips active="" />

      {(q || region) && (
        <p className="catalogue-filters">
          Showing {q ? `results for "${q}"` : "everything"}
          {region ? ` available in ${region}` : ""}.{" "}
          <button className="catalogue-clear" onClick={clearFilters}>
            Clear filters
          </button>
        </p>
      )}

      {searching ? <SearchResults q={q} region={region} /> : <CategoryPreviews region={region} />}
    </section>
  );
}