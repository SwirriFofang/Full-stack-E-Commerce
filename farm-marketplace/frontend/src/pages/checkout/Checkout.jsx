import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import PaymentDone from "../../components/paymentDone/PaymentDone";
import PaymentMethods from "../../components/paymentMethods/PaymentMethods";
import { REGIONS, TOWNS_BY_REGION } from "../../utils/constants";
import { formatMoney } from "../../utils/format";
import FormField from "../../components/formField/FormField";
import useFormErrors from "../../hooks/useFormErrors";
import { check, compact } from "../../utils/validators";
import { cleanPhone, isValidPhone } from "../../utils/phone";
import EmptyCart from "../../components/emptyCart/EmptyCart";
import "./Checkout.css";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [contact, setContact] = useState({ name: user.name || "", phone: user.phone || "" });
  const [fulfilment, setFulfilment] = useState("pickup");
  const [address, setAddress] = useState({ region: "", town: "", details: "" });
  const [saved, setSaved] = useState([]);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("momo_mtn");
  const [momoPhone, setMomoPhone] = useState(user.phone || "");
  const [transferSent, setTransferSent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // the paid orders, shown in the popup

  useEffect(() => {
    api
      .get("/account/addresses")
      .then((res) => setSaved(res.data.addresses))
      .catch(() => { }); // not important: the form still works without it
  }, []);

  const setContactField = (field) => (e) => setContact({ ...contact, [field]: e.target.value });
  const setAddressField = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

  const fillFromSaved = (id) => {
    const a = saved.find((s) => s._id === id);
    if (a) setAddress({ region: a.region || "", town: a.town || "", details: a.details || "" });
  };

  // Offer the contact number as the wallet number when it is still empty
  const changeMethod = (value) => {
    setMethod(value);
    if (value !== "bank_transfer" && !momoPhone.trim()) setMomoPhone(contact.phone);
  };

  // In the same order as the form
  const errors = compact({
    name: check.name(contact.name),
    phone: check.phone(contact.phone, { required: true }),
    region: fulfilment === "delivery" ? check.region(address.region) : "",
    town: fulfilment === "delivery" ? check.town(address.region, address.town) : "",
    details: fulfilment === "delivery" && address.details.length > 200 ? "Keep it to 200 characters or fewer." : "",
    momoPhone: method !== "bank_transfer" ? check.phone(momoPhone, { required: true }) : "",
    transferSent: method === "bank_transfer" && !transferSent ? "Tick the box to confirm you sent the transfer." : "",
  });
  const f = useFormErrors(errors, "co");

  const placeOrder = async (e) => {
    e.preventDefault();
    if (busy) return;

    const message = problem();
    if (!f.validate()) {
      setError("Please fix the fields marked in red.");
      return;
    }
    setError("");
    setBusy(true);

    try {
      const body = {
        // Only ids and quantities are sent. The server looks up the real prices.
        items: items.map((i) => ({
          source: i.source,
          itemId: i.itemId,
          variantId: i.source === "catalog" ? i.variantId : undefined,
          quantity: i.quantity,
        })),
        fulfilment,
        contact: { name: contact.name.trim(), phone: cleanPhone(contact.phone) },
        payment: { method },
      };
      if (method !== "bank_transfer") body.payment.phone = cleanPhone(momoPhone);
      if (note.trim()) body.note = note.trim();
      if (fulfilment === "delivery") {
        body.address = { region: address.region };
        if (address.town.trim()) body.address.town = address.town.trim();
        if (address.details.trim()) body.address.details = address.details.trim();
      }

      const { data } = await api.post("/orders", body);
      clear(); // the orders exist now, so the basket can be emptied

      // Mock payment: no real money moves
      const finished = [];
      for (const order of data.orders) {
        try {
          const res = await api.post(`/orders/${order._id}/pay`);
          finished.push(res.data.order);
        } catch {
          finished.push(order); // placed, but not paid
        }
      }
      setResult(finished);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="container checkout checkout-done">
        <h1>Thank you for your order</h1>
        <PaymentDone orders={result} onClose={() => navigate("/")} onViewOrders={() => navigate("/account")} />
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="container checkout">
      <h1>Checkout</h1>

      <form className="checkout-layout" onSubmit={placeOrder} noValidate>
        <div className="checkout-main">

          <fieldset className="checkout-box">
            <legend>Your details</legend>
            <div className="checkout-row">
              <FormField label="Full name" id={f.id("name")} error={f.shown("name")}>
                {(p) => (
                  <input {...p} maxLength={80} autoComplete="name" value={contact.name} onChange={setContactField("name")} onBlur={f.touch("name")} />
                )}
              </FormField>
              <FormField
                label="Phone number"
                id={f.id("phone")}
                error={f.shown("phone")}
                hint="The seller or our team uses this number to reach you about your order."
              >
                {(p) => (
                  <input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="6XX XX XX XX" value={contact.phone} onChange={setContactField("phone")} onBlur={f.touch("phone")} />
                )}
              </FormField>
            </div>
          </fieldset>

          <fieldset className="checkout-box">
            <legend>How do you want to get your food?</legend>
            <label className="choice">
              <input
                type="radio"
                name="fulfilment"
                value="pickup"
                checked={fulfilment === "pickup"}
                onChange={() => setFulfilment("pickup")}
              />
              <span>
                <b>Pickup</b>
                <small>You collect it from the seller.</small>
              </span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="fulfilment"
                value="delivery"
                checked={fulfilment === "delivery"}
                onChange={() => setFulfilment("delivery")}
              />
              <span>
                <b>Delivery</b>
                <small>It is brought to your address. A delivery fee may apply.</small>
              </span>
            </label>
          </fieldset>

          {fulfilment === "delivery" && (
            <fieldset className="checkout-box">
              <legend>Delivery location</legend>

              {saved.length > 0 && (
                <label className="checkout-field">
                  Use a saved address
                  <select defaultValue="" onChange={(e) => fillFromSaved(e.target.value)}>
                    <option value="">Choose one...</option>
                    {saved.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="checkout-row">
                <FormField label="Region" id={f.id("region")} error={f.shown("region")}>
                  {(p) => (
                    <select {...p} value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value, town: "" })} onBlur={f.touch("region")}>
                      <option value="">Choose your region</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
                <FormField label="Town" id={f.id("town")} error={f.shown("town")}>
                  {(p) => (
                    <select {...p} value={address.town} onChange={setAddressField("town")} onBlur={f.touch("town")} disabled={!address.region}>
                      <option value="">{address.region ? "Choose your town" : "Choose a region first"}</option>
                      {(TOWNS_BY_REGION[address.region] || []).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
              </div>
              <FormField label="Street, landmark or directions (optional)" id={f.id("details")} error={f.shown("details")} count={`${address.details.length}/200`}>
                {(p) => <input {...p} maxLength={200} value={address.details} onChange={setAddressField("details")} onBlur={f.touch("details")} />}
              </FormField>

              <label className="checkout-field">
                Street, landmark or directions
                <input maxLength={200} value={address.details} onChange={setAddressField("details")} />
              </label>
            </fieldset>
          )}

          <fieldset className="checkout-box">
            <legend>Note (optional)</legend>
            <label className="checkout-field">
              Anything the seller should know?
              <input
                maxLength={200}
                placeholder="For example: please call before you arrive"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </fieldset>

          <PaymentMethods
            method={method}
            onMethodChange={changeMethod}
            phone={momoPhone}
            onPhoneChange={setMomoPhone}
            transferSent={transferSent}
            onTransferSentChange={setTransferSent}
            total={total}
            onPhoneBlur={f.touch("momoPhone")}
            phoneError={f.shown("momoPhone")}
            transferError={f.shown("transferSent")}
          />

          <p className="checkout-demo">
            This is a demo. Clicking Make payment marks your order as paid, and no real money is taken.
          </p>
        </div>

        <aside className="checkout-summary">
          <h2>Your order</h2>
          <ul>
            {items.map((line) => (
              <li key={line.key}>
                <span>
                  {line.quantity} × {line.name}
                  <small>{line.label}</small>
                </span>
                <b>{formatMoney(line.price * line.quantity)}</b>
              </li>
            ))}
          </ul>

          <p className="checkout-total">
            <span>Items total</span>
            <b>{formatMoney(total)}</b>
          </p>
          <p className="checkout-note">Any delivery fee is added when the order is placed.</p>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Processing..." : `Make payment · ${formatMoney(total)}`}
          </button>
          <Link to="/cart" className="checkout-back">
            Back to basket
          </Link>
        </aside>
      </form>
    </div>
  );
}