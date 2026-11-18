import { useEffect, useMemo, useRef, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, REGIONS, TOWNS_BY_REGION, UNITS } from "../../utils/constants";
import { fileUrl } from "../../utils/format";
import "./ListingForm.css";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 300;
const NAME_PATTERN = /^[\p{L}\p{N}\s'’().,&-]+$/u;

const pad = (n) => String(n).padStart(2, "0");
// A date input wants local time like "2026-12-20T18:00"
const toLocalInput = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Returns { fieldName: "message" } in the same order as the form
function validate(form) {
  const errors = {};

  const title = form.title.trim();
  if (title.length < 3) errors.title = "Enter at least 3 characters.";
  else if (title.length > TITLE_MAX) errors.title = `Keep it to ${TITLE_MAX} characters or fewer.`;
  else if (!NAME_PATTERN.test(title)) {
    errors.title = "Use letters, numbers and spaces. The marks . , ( ) & ' - are also allowed.";
  }

  if (!form.category) errors.category = "Choose a category.";

  const price = Number(form.price);
  if (form.price === "" || !Number.isInteger(price) || price < 1) errors.price = "Enter a whole number of 1 or more.";
  else if (price > 10_000_000) errors.price = "That price is too high.";

  const quantity = Number(form.quantityAvailable);
  if (form.quantityAvailable === "" || !(quantity > 0)) errors.quantityAvailable = "Enter a quantity above 0.";
  else if (quantity > 1_000_000) errors.quantityAvailable = "That quantity is too high.";

  if (!form.region) errors.region = "Choose a region.";
  if (!form.region) errors.town = "Choose a region first.";
  else if (!TOWNS_BY_REGION[form.region]?.includes(form.town)) errors.town = "Choose a town from the list.";

  if (!form.expiresAt) errors.expiresAt = "Choose when the offer ends.";
  else if (new Date(form.expiresAt).getTime() <= Date.now()) {
    errors.expiresAt = "That time has already passed. Choose a time in the future.";
  }

  if (form.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Keep it to ${DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!form.pickup && !form.delivery) errors.collect = "Choose pickup, delivery or both.";
  if (form.delivery) {
    const fee = Number(form.fee);
    if (form.fee === "" || !Number.isInteger(fee) || fee < 0) errors.fee = "Enter a whole number, or 0 for free delivery.";
  }

  return errors;
}

function FieldError({ id, text }) {
  if (!text) return null;
  return (
    <small id={id} className="lf-error" role="alert">
      {text}
    </small>
  );
}

// mode: "create", "edit" or "relist"
export default function ListingForm({ mode, listing, onClose, onSaved }) {
  const { user } = useAuth();
  const dialogRef = useRef(null);
  const relist = mode === "relist";

  const [form, setForm] = useState(() => {
    if (listing) {
      return {
        title: listing.title,
        category: listing.category,
        description: listing.description || "",
        price: String(listing.price),
        unit: listing.unit,
        quantityAvailable: relist && listing.quantityAvailable === 0 ? "" : String(listing.quantityAvailable),
        region: listing.location.region,
        town: listing.location.town || "",
        pickup: listing.delivery?.pickup ?? true,
        delivery: listing.delivery?.delivery ?? false,
        fee: String(listing.delivery?.fee ?? 0),
        expiresAt: relist ? "" : toLocalInput(listing.expiresAt),
      };
    }
    // A new listing starts with the seller's own region and town, when they are on the lists
    const region = REGIONS.includes(user.sellerProfile?.region) ? user.sellerProfile.region : "";
    const town = TOWNS_BY_REGION[region]?.includes(user.sellerProfile?.town) ? user.sellerProfile.town : "";
    return {
      title: "",
      category: "",
      description: "",
      price: "",
      unit: "kg",
      quantityAvailable: "",
      region,
      town,
      pickup: true,
      delivery: false,
      fee: "0",
      expiresAt: toLocalInput(Date.now() + 24 * 60 * 60 * 1000),
    };
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  const errors = validate(form);
  const shown = (field) => (touched[field] || submitted ? errors[field] : undefined);
  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const invalid = (field) => (shown(field) ? "true" : undefined);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setRegion = (e) => setForm({ ...form, region: e.target.value, town: "" });
  const check = (field) => (e) => setForm({ ...form, [field]: e.target.checked });

  const towns = TOWNS_BY_REGION[form.region] || [];

  const pickFile = (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(chosen.type)) {
      setError("The picture must be a JPG, PNG or WEBP file.");
      e.target.value = "";
      return;
    }
    if (chosen.size > 5 * 1024 * 1024) {
      setError("The picture must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setError("");
    setFile(chosen);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Check again now, because time may have passed since the form was opened
    const problems = validate(form);
    const first = Object.keys(problems)[0];
    if (first) {
      setError("Please fix the fields marked in red.");
      document.getElementById(`lf-${first}`)?.focus();
      return;
    }
    setError("");

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("category", form.category);
    data.append("description", form.description.trim());
    data.append("price", form.price);
    data.append("unit", form.unit);
    data.append("quantityAvailable", form.quantityAvailable);
    data.append("location", JSON.stringify({ region: form.region, town: form.town }));
    data.append(
      "delivery",
      JSON.stringify({ pickup: form.pickup, delivery: form.delivery, fee: form.delivery ? Number(form.fee) : 0 })
    );
    data.append("expiresAt", new Date(form.expiresAt).toISOString());
    if (file) data.append("image", file);

    setBusy(true);
    try {
      if (listing) await api.patch(`/listings/${listing._id}`, data);
      else await api.post("/listings", data);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const title = relist ? "Relist this offer" : listing ? "Edit listing" : "New listing";
  const shownImage = preview || (listing?.image ? fileUrl(listing.image) : "");

  return (
    <dialog
      ref={dialogRef}
      className="lf-dialog"
      aria-labelledby="lf-heading"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form className="lf" onSubmit={submit} noValidate>
        <h2 id="lf-heading">{title}</h2>
        {relist && <p className="lf-note">Choose a new end time and check the quantity. The offer goes live again.</p>}

        <label className="lf-field">
          <span className="lf-label-row">
            Food name <span className="lf-count">{form.title.length}/{TITLE_MAX}</span>
          </span>
          <input
            id="lf-title"
            maxLength={TITLE_MAX}
            value={form.title}
            onChange={set("title")}
            onBlur={touch("title")}
            aria-invalid={invalid("title")}
            aria-describedby="lf-title-error"
          />
          <FieldError id="lf-title-error" text={shown("title")} />
        </label>

        <div className="lf-grid">
          <label className="lf-field">
            Category
            <select
              id="lf-category"
              value={form.category}
              onChange={set("category")}
              onBlur={touch("category")}
              aria-invalid={invalid("category")}
              aria-describedby="lf-category-error"
            >
              <option value="">Choose a category</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError id="lf-category-error" text={shown("category")} />
          </label>
          <label className="lf-field">
            Sold per
            <select value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="lf-field">
            Price per {form.unit} (FCFA)
            <input
              id="lf-price"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.price}
              onChange={set("price")}
              onBlur={touch("price")}
              aria-invalid={invalid("price")}
              aria-describedby="lf-price-error"
            />
            <FieldError id="lf-price-error" text={shown("price")} />
          </label>
          <label className="lf-field">
            Quantity available
            <input
              id="lf-quantityAvailable"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.quantityAvailable}
              onChange={set("quantityAvailable")}
              onBlur={touch("quantityAvailable")}
              aria-invalid={invalid("quantityAvailable")}
              aria-describedby="lf-quantity-error"
            />
            <FieldError id="lf-quantity-error" text={shown("quantityAvailable")} />
          </label>
          <label className="lf-field">
            Region
            <select
              id="lf-region"
              value={form.region}
              onChange={setRegion}
              onBlur={touch("region")}
              aria-invalid={invalid("region")}
              aria-describedby="lf-region-error"
            >
              <option value="">Choose a region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <FieldError id="lf-region-error" text={shown("region")} />
          </label>
          <label className="lf-field">
            Town
            <select
              id="lf-town"
              value={form.town}
              onChange={set("town")}
              onBlur={touch("town")}
              disabled={!form.region}
              aria-invalid={invalid("town")}
              aria-describedby="lf-town-error"
            >
              <option value="">{form.region ? "Choose a town" : "Choose a region first"}</option>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FieldError id="lf-town-error" text={shown("town")} />
          </label>
        </div>

        <label className="lf-field">
          Offer ends
          <input
            id="lf-expiresAt"
            type="datetime-local"
            min={toLocalInput(Date.now())}
            value={form.expiresAt}
            onChange={set("expiresAt")}
            onBlur={touch("expiresAt")}
            aria-invalid={invalid("expiresAt")}
            aria-describedby="lf-expires-error lf-expires-help"
          />
          <small id="lf-expires-help">After this time the offer shows as Expired, and disappears 24 hours later.</small>
          <FieldError id="lf-expires-error" text={shown("expiresAt")} />
        </label>

        <label className="lf-field">
          <span className="lf-label-row">
            Description (optional) <span className="lf-count">{form.description.length}/{DESCRIPTION_MAX}</span>
          </span>
          <textarea
            id="lf-description"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            value={form.description}
            onChange={set("description")}
            onBlur={touch("description")}
            aria-invalid={invalid("description")}
            aria-describedby="lf-description-error"
          />
          <FieldError id="lf-description-error" text={shown("description")} />
        </label>

        <fieldset className="lf-collect">
          <legend>How can buyers get it?</legend>
          <label className="lf-check">
            <input id="lf-collect" type="checkbox" checked={form.pickup} onChange={check("pickup")} />
            Pickup
          </label>
          <label className="lf-check">
            <input type="checkbox" checked={form.delivery} onChange={check("delivery")} />
            Delivery
          </label>
          {form.delivery && (
            <label className="lf-field lf-fee">
              Delivery fee (FCFA)
              <input
                id="lf-fee"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.fee}
                onChange={set("fee")}
                onBlur={touch("fee")}
                aria-invalid={invalid("fee")}
                aria-describedby="lf-fee-error"
              />
              <FieldError id="lf-fee-error" text={shown("fee")} />
            </label>
          )}
          <FieldError text={shown("collect")} />
        </fieldset>

        <div className="lf-field">
          <label htmlFor="lf-image">Picture (JPG, PNG or WEBP, up to 5 MB)</label>
          <input id="lf-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
          {shownImage && <img className="lf-preview" src={shownImage} alt="Preview of the chosen picture" />}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="lf-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving..." : relist ? "Relist offer" : listing ? "Save changes" : "Publish listing"}
          </button>
        </div>
      </form>
    </dialog>
  );
}