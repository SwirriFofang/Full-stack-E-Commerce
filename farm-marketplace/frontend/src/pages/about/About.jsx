import "./About.css";

export default function About() {
  return (
    <div className="container about">
      <h1>About FarmFresh</h1>
      <p>
        FarmFresh connects farmers and local traders directly with people who want fresh food.
        Sellers list what they have today, with the price, the quantity and the time the offer ends.
        Buyers browse, order and pick up or receive their food.
      </p>
      <p>
        Offers that have ended stay visible for 24 hours with an Expired label, then disappear, so
        you only ever see produce that is fresh or just sold.
      </p>
    </div>
  );
}