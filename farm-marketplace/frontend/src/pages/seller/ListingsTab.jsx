import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import ListingForm from "../../components/listingForm/ListingForm";
import { CATEGORY_EMOJI } from "../../utils/constants";
import { formatMoney, formatDate, fileUrl } from "../../utils/format";
   import { useFeedback } from "../../context/FeedbackContext";

const FILTERS = [
  ["", "All"],
  ["active", "Active"],
  ["sold_out", "Sold out"],
  ["expired", "Expired"],
];
const STATUS_LABEL = { active: "Active", sold_out: "Sold out", expired: "Expired" };

export default function ListingsTab() {
  const [filter, setFilter] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // { mode, listing } or null

    const { confirm, toast } = useFeedback();
  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/listings/mine", { params: { status: filter || undefined } });
      setListings(data.listings);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

    const remove = async (listing) => {
    const ok = await confirm({
      title: "Delete this listing?",
      message: `"${listing.title}" will no longer be visible to buyers. This cannot be undone.`,
      confirmLabel: "Yes, delete",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/listings/${listing._id}`);
      toast("Deleted Successfully");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saved = () => {
    const messages = { create: "Added Successfully", edit: "Edited Successfully", relist: "Relisted Successfully" };
    toast(messages[editor.mode]);
    setEditor(null);
    load();
  };

  return (
    <>
      <div className="seller-bar">
        <div className="seller-chips">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              className={`seller-chip ${filter === value ? "seller-chip-active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setEditor({ mode: "create" })}>
          New listing
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="account-status">Loading...</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="account-status">
          {filter ? "No listings match this filter." : "You have no listings yet. Click New listing to add your first one."}
        </p>
      )}

      <ul className="my-listings">
        {listings.map((l) => {
          const canRelist = l.status === "expired" || l.status === "sold_out";
          return (
            <li key={l._id} className="my-listing">
              <div className="my-listing-image">
                {l.image ? <img src={fileUrl(l.image)} alt="" /> : <span aria-hidden="true">{CATEGORY_EMOJI[l.category]}</span>}
              </div>

              <div className="my-listing-info">
                <p className="my-listing-title">
                  {l.title} <span className={`status-badge status-${l.status}`}>{STATUS_LABEL[l.status]}</span>
                </p>
                <p className="my-listing-meta">
                  {formatMoney(l.price)} per {l.unit} · {l.quantityAvailable} {l.unit} left
                </p>
                <p className="my-listing-meta">
                  {l.status === "expired" ? "Ended" : "Ends"} {formatDate(l.expiresAt)}
                </p>
              </div>

              <div className="my-listing-actions">
                {canRelist && (
                  <button className="btn btn-primary" onClick={() => setEditor({ mode: "relist", listing: l })}>
                    Relist
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => setEditor({ mode: "edit", listing: l })}>
                  Edit
                </button>
                <button className="link-danger" onClick={() => remove(l)} aria-label={`Remove ${l.title}`}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {editor && <ListingForm mode={editor.mode} listing={editor.listing} onClose={() => setEditor(null)} onSaved={saved} />}
    </>
  );
}