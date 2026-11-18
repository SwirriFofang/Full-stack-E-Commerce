import { useEffect, useState } from "react";
import api from "../api/axios";

const PAGE_SIZE = 24;
export const keyOf = (item) => `${item.source}-${item._id}`;

export default function useProducts({ q = "", category = "", region = "" }) {
  const filterKey = `${q}|${category}|${region}`;

  // The page number belongs to the filters it was chosen for, so new filters start at page 1
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const page = paging.key === filterKey ? paging.page : 1;

  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/products", {
        params: {
          q: q || undefined,
          category: category || undefined,
          region: region || undefined,
          page,
          limit: PAGE_SIZE,
        },
      })
      .then((res) => {
        if (cancelled) return;
        setData((prev) => {
          if (page === 1) return { items: res.data.items, total: res.data.total };
          const seen = new Set(prev.items.map(keyOf));
          return {
            items: [...prev.items, ...res.data.items.filter((i) => !seen.has(keyOf(i)))],
            total: res.data.total,
          };
        });
      })
      .catch(() => !cancelled && setError("Could not load the products"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, category, region, page]);

  return {
    items: data.items,
    total: data.total,
    loading,
    error,
    hasMore: data.items.length < data.total,
    loadMore: () => setPaging({ key: filterKey, page: page + 1 }),
  };
}