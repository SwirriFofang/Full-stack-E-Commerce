import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import Pager from "../../components/pager/Pager";
import { CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, formatDate, fileUrl } from "../../utils/format";
import { useFeedback } from "../../context/FeedbackContext";

const FILTERS = [
  ["", "All"],
  ["active", "Active"],
  ["sold_out", "Sold out"],
  ["expired", "Expired"],
  ["suspended", "Suspended"],
  ["archived", "Removed"],
];
const STATUS_LABEL = {
  active: "Active",
  sold_out: "Sold out",
  expired: "Expired",
  suspended: "Suspended",
  archived: "Removed",
};

export default function AdminListings() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    const { confirm, toast } = useFeedback();
  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/admin/listings", {
        params: { status: status || undefined, q: search || undefined, page },
      });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(input.trim());
  };

  const pickStatus = (value) => {
    setPage(1);
    setStatus(value);
  };

    const remove = async (listing) => {
    const ok = await confirm({
      title: "Remove this listing?",
      message: `"${listing.title}" will no longer be visible to buyers.`,
      confirmLabel: "Yes, remove",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/listings/${listing._id}`);
      toast("Removed Successfully");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <div className="admin-filters">
        <form className="admin-search" onSubmit={submitSearch}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search listings by name"
            aria-label="Search listings"
          />
          <button className="btn btn-outline">Search</button>
        </form>
      </div>
      <div className="seller-chips seller-bar">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            className={`seller-chip ${status === value ? "seller-chip-active" : ""}`}
            onClick={() => pickStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="account-status">Loading...</p>}
      {!loading && !error && data.items.length === 0 && <p className="account-status">No listings here.</p>}

      <ul className="my-listings">
        {data.items.map((l) => (
          <li key={l._id} className="my-listing">
            <div className="my-listing-image">
              {l.image ? <img src={fileUrl(l.image)} alt="" /> : <span aria-hidden="true">{CATEGORY_EMOJI[l.category]}</span>}
            </div>
            <div className="my-listing-info">
              <p className="my-listing-title">
                {l.title} <span className={`status-badge status-${l.status}`}>{STATUS_LABEL[l.status]}</span>
              </p>
              <p className="my-listing-meta">
                By {l.seller?.sellerProfile?.shopName || l.seller?.name} ({l.seller?.email})
              </p>
              <p className="my-listing-meta">
                {formatMoney(l.price)} per {l.unit} · {l.quantityAvailable} {l.unit} left · Ends {formatDate(l.expiresAt)}
              </p>
            </div>
            <div className="my-listing-actions">
              {l.status !== "archived" && (
                <button className="link-danger" onClick={() => remove(l)} aria-label={`Remove ${l.title}`}>
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Pager page={page} pages={data.pages} onChange={setPage} />
    </>
  );
}