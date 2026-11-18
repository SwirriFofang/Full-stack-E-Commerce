import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import CatalogItemForm from "../../components/catalogItemForm/CatalogItemForm";
import Pager from "../../components/pager/Pager";
import { CATEGORIES, CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, fileUrl } from "../../utils/format";
import { useFeedback } from "../../context/FeedbackContext";

const categoryLabel = (value) => CATEGORIES.find(([v]) => v === value)?.[1] || value;

export default function AdminCatalogue() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // { item } and item is empty for a new one

    const { confirm, toast } = useFeedback();
  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/catalog", {
        params: { q: search || undefined, category: category || undefined, page, limit: 60 },
      });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(input.trim());
  };

  const pickCategory = (e) => {
    setPage(1);
    setCategory(e.target.value);
  };

    const remove = async (item) => {
    const ok = await confirm({
      title: "Delete this item?",
      message: `"${item.name}" disappears from the shop. Baskets that still hold it will lose it at checkout.`,
      confirmLabel: "Yes, delete",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/catalog/${item._id}`);
      toast("Deleted Successfully");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saved = () => {
    toast(editor?.item ? "Edited Successfully" : "Added Successfully");
    setEditor(null);
    load();
  };

  return (
    <>
      <div className="admin-filters">
        <form className="admin-search" onSubmit={submitSearch}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search the catalogue"
            aria-label="Search the catalogue"
          />
          <button className="btn btn-outline">Search</button>
        </form>
        <select className="admin-select" value={category} onChange={pickCategory} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => setEditor({})}>
          New item
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="account-status">Loading...</p>}
      {!loading && !error && <p className="admin-count">{data.total} items</p>}

      <ul className="my-listings">
        {data.items.map((item) => (
          <li key={item._id} className="my-listing">
            <div className="my-listing-image">
              {item.image ? (
                <img src={fileUrl(item.image)} alt="" />
              ) : (
                <span aria-hidden="true">{CATEGORY_EMOJI[item.category]}</span>
              )}
            </div>
            <div className="my-listing-info">
              <p className="my-listing-title">
                {item.name}
                {!item.image && <span className="status-badge status-expired">No picture</span>}
              </p>
              <p className="my-listing-meta">{categoryLabel(item.category)}</p>
              <p className="my-listing-meta">
                {item.variants.map((v) => `${v.label}: ${formatMoney(v.price)}`).join(" · ")}
              </p>
            </div>
            <div className="my-listing-actions">
              <button className="btn btn-outline" onClick={() => setEditor({ item })}>
                Edit
              </button>
              <button className="link-danger" onClick={() => remove(item)} aria-label={`Delete ${item.name}`}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Pager page={page} pages={data.pages} onChange={setPage} />

      {editor && (
        <CatalogItemForm key={editor.item?._id || "new"} item={editor.item} onClose={() => setEditor(null)} onSaved={saved} />
      )}
    </>
  );
}