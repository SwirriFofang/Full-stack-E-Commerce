import { useState } from "react";
import { BANK_ACCOUNTS, PAYMENT_METHODS } from "../../utils/constants";
import { formatMoney } from "../../utils/format";
import "./PaymentMethods.css";

const OPTIONS = [
  ["momo_mtn", "Pay from your MTN Mobile Money wallet", "mtn"],
  ["momo_orange", "Pay from your Orange Money wallet", "orange"],
  ["bank_transfer", "Send money from your bank, then confirm here", "bank"],
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard can be blocked; the number is still shown on screen
    }
  };

  return (
    <button type="button" className="pm-copy" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function PaymentMethods({
  method,
  onMethodChange,
  phone,
  onPhoneChange,
  transferSent,
  onTransferSentChange,
  total,
  onPhoneBlur, phoneError, transferError,
}) {
  const isMomo = method === "momo_mtn" || method === "momo_orange";

  return (
    <fieldset className="checkout-box pm">
      <legend>How do you want to pay?</legend>

      <div className="pm-options">
        {OPTIONS.map(([value, help, kind]) => (
          <label key={value} className="pm-choice">
            <input
              type="radio"
              name="paymentMethod"
              value={value}
              checked={method === value}
              onChange={() => onMethodChange(value)}
            />
            <span className={`pm-dot pm-dot-${kind}`} aria-hidden="true" />
            <span className="pm-text">
              <b>{PAYMENT_METHODS[value]}</b>
              <small>{help}</small>
            </span>
          </label>
        ))}
      </div>

      {isMomo && (
        <div className="pm-panel">
          <label className="checkout-field">
            {PAYMENT_METHODS[method]} number
            <input
              id="co-momoPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="6XX XX XX XX"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={onPhoneBlur}
              aria-invalid={phoneError ? "true" : undefined}
            />
            <small>Enter the number registered with {PAYMENT_METHODS[method]}.</small>
            {phoneError && (
              <small className="ff-error" role="alert">
                {phoneError}
              </small>
            )}
          </label>
        </div>
      )}

      {method === "bank_transfer" && (
        <div className="pm-panel">
          <p className="pm-amount">
            Amount to send: <b>{formatMoney(total)}</b> plus any delivery fee.
          </p>

          {BANK_ACCOUNTS.map((account) => (
            <dl key={account.accountNumber} className="pm-bank">
              <dt>Bank</dt>
              <dd>{account.bank}</dd>
              <dt>Account name</dt>
              <dd>{account.accountName}</dd>
              <dt>Account number</dt>
              <dd>
                {account.accountNumber}
                <CopyButton text={account.accountNumber} label="account number" />
              </dd>
              {account.branch && (
                <>
                  <dt>Branch</dt>
                  <dd>{account.branch}</dd>
                </>
              )}
            </dl>
          ))}

          <p className="pm-tip">Use your full name as the payment reference so we can match your transfer.</p>

          <label className="pm-confirm">
            <input
              id="co-transferSent"
              type="checkbox"
              checked={transferSent}
              onChange={(e) => onTransferSentChange(e.target.checked)}
            />
            I have sent the transfer using the details above
          </label>
          {transferError && (
            <small className="ff-error" role="alert">
              {transferError}
            </small>
          )}
        </div>
      )}
    </fieldset>
  );
}