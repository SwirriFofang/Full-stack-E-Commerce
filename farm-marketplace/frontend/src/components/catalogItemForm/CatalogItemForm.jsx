import { useEffect, useMemo, useRef, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import { CATEGORIES } from "../../utils/constants";
import { fileUrl } from "../../utils/format";
import "../listingForm/ListingForm.css";
import "./CatalogItemForm.css";

let rowCounter = 0;
// _id is the size's id in the database. Sending it back keeps old basket lines working.
const newRow = (v = {}) => ({
  key: ++rowCounter,
  _id: v._id,
  label: v.label || "",
  price: v.price !== undefined ? String(v.price) : "",
});

// item is empty when adding a new one
export default function CatalogItemForm({ item, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    name: item?.name || "",
    category: item?.category || "",
    description: item?.description || "",
  });
  const [rows, setRows] = useState(() => (item ? item.variants.map(newRow) : [newRow()]));
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

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setRow = (key, field) => (e) =>
    setRows(rows.map((r) => (r.key === key ? { ...r, [field]: e.target.value } : r)));
  const addRow = () => rows.length < 8 && setRows([...rows, newRow()]);
  const removeRow = (key) => rows.length > 1 && setRows(rows.filter((r) => r.key !== key));

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
    setError("");

    const labels = rows.map((r) => r.label.trim().toLowerCase());
    if (rows.some((r) => !r.label.trim() || r.price === "" || !(Number(r.price) >= 0))) {
      setError("Give every size a name and a price.");
      return;
    }
    if (new Set(labels).size !== labels.length) {
      setError("Two sizes have the same name. Make each one different.");
      return;
    }

    const variants = rows.map((r) => ({
      ...(r._id ? { _id: r._id } : {}),
      label: r.label.trim(),
      price: Number(r.price),
    }));

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("category", form.category);
    data.append("description", form.description.trim());
    data.append("variants", JSON.stringify(variants));
    if (file) data.append("image", file);

    setBusy(true);
    try {
      if (item) await api.patch(`/catalog/${item._id}`, data);
      else await api.post("/catalog", data);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const shownImage = preview || (item?.image ? fileUrl(item.image) : "");

  return (
    <dialog
      ref={dialogRef}
      className="lf-dialog"
      aria-labelledby="cif-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form className="lf" onSubmit={submit}>
        <h2 id="cif-title">{item ? "Edit catalogue item" : "New catalogue item"}</h2>

        <div className="lf-grid">
          <label className="lf-field">
            Name
            <input required minLength={2} maxLength={80} value={form.name} onChange={set("name")} />
          </label>
          <label className="lf-field">
            Category
            <select required value={form.category} onChange={set("category")}>
              <option value="">Choose a category</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="lf-field">
          Description (optional)
          <textarea rows={2} maxLength={300} value={form.description} onChange={set("description")} />
        </label>

        <fieldset className="cif-sizes">
          <legend>Sizes and prices (FCFA)</legend>
          <ul className="cif-rows">
            {rows.map((r, i) => (
              <li key={r.key} className="cif-row">
                <label className="lf-field">
                  Size {i + 1}
                  <input
                    required
                    maxLength={40}
                    placeholder="for example 1 kg, 500 g or Pack of 6"
                    value={r.label}
                    onChange={setRow(r.key, "label")}
                  />
                </label>
                <label className="lf-field">
                  Price
                  <input type="number" required min="0" step="any" value={r.price} onChange={setRow(r.key, "price")} />
                </label>
                <button
                  type="button"
                  className="cif-remove"
                  onClick={() => removeRow(r.key)}
                  disabled={rows.length === 1}
                  aria-label={`Remove size ${i + 1}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-outline" onClick={addRow} disabled={rows.length >= 8}>
            Add another size
          </button>
        </fieldset>

        <div className="lf-field">
          <label htmlFor="cif-image">Picture (JPG, PNG or WEBP, up to 5 MB)</label>
          <input id="cif-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
          {shownImage && <img className="lf-preview" src={shownImage} alt="Preview of the picture" />}
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
            {busy ? "Saving..." : item ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </dialog>
  );
}