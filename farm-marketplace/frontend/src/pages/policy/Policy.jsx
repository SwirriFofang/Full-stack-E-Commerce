import { SITE_NAME } from "../../utils/constants";
import "./Policy.css";

const POLICIES = {
  terms: {
    title: "Terms and conditions",
    sections: [
      ["Using the site", `Anyone can browse ${SITE_NAME}. You need an account to order food or to sell. You must give correct details and keep your password private.`],
      ["Sellers", "Sellers are responsible for their listings: the food must be real, the price, quantity and end time must be correct, and only food may be listed. We can remove listings and suspend accounts that break these rules."],
      ["Offers and orders", "An offer ends at the time shown. Ended offers cannot be ordered. When you place an order, the seller (or our team, for catalogue items) prepares it for pickup or delivery."],
      ["Payment", "You can pay with the methods shown at checkout. Prices are shown in FCFA."],
      ["Changes", "We may update these terms. Using the site after a change means you accept the new version."],
    ],
  },
  privacy: {
    title: "Privacy notice",
    sections: [
      ["What we collect", "Your name, email, phone number, delivery addresses, your orders and, for sellers, your shop details."],
      ["Why we collect it", "To run your account, process and deliver orders, contact you about an order, and keep the site safe."],
      ["Who can see it", "A seller sees the name, phone number and delivery address of the buyers who order from them. We do not sell your information."],
      ["Passwords and sessions", "Passwords are stored in a scrambled form that we cannot read. We use a small cookie to keep you logged in."],
      ["Your choices", "You can ask us to correct or delete your information by contacting us using the details in the footer."],
    ],
  },
  shipping: {
    title: "Shipping policy",
    sections: [
      ["Pickup or delivery", "Each order is either collected from the seller or delivered. Sellers say whether they offer delivery."],
      ["Delivery fees", "Any delivery fee is set by the seller (or by us for catalogue items) and is shown on your order."],
      ["Tracking", "Follow your order in My account. It moves from placed to confirmed, packed, and then collected or delivered."],
      ["Problems", "If your order is late or something is wrong, contact the seller or us using the details in the footer."],
    ],
  },
  refunds: {
    title: "Refund policy",
    sections: [
      ["Cancelling", "You can cancel an order yourself while it is still pending. A paid order that is cancelled is marked as refunded."],
      ["After confirmation", "Once the seller has confirmed an order, contact the seller or us to ask for a cancellation."],
      ["Fresh food problems", "If food arrives damaged or not as described, tell us within [set your time limit] of receiving it, with a short description or photo."],
      ["How refunds are paid", "Refunds go back to the method you paid with, or as agreed with you."],
    ],
  },
};

export default function Policy({ page }) {
  const policy = POLICIES[page];

  return (
    <div className="container policy">
      <h1>{policy.title}</h1>
      <p className="policy-draft">Draft text. Replace it with your own policy before you launch.</p>
      {policy.sections.map(([heading, text]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}