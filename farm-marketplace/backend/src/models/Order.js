import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["listing", "catalog"], default: "listing" },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    catalogItem: { type: mongoose.Schema.Types.ObjectId, ref: "CatalogItem" },
    // Snapshot of the details at purchase time, in case the item changes later
    title: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // For listings: "kg". For catalogue items: the size label, such as "500 g"
    unit: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // empty for FarmFresh orders
    soldBy: { type: String, enum: ["seller", "platform"], default: "seller" },
    items: { type: [itemSchema], required: true },
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    fulfilment: { type: String, enum: ["pickup", "delivery"], required: true },
    address: { region: String, town: String, details: String },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    note: { type: String, trim: true, maxlength: 200 },
    paymentMethod: { type: String, enum: ["momo_mtn", "momo_orange", "bank_transfer"] },
    paymentPhone: { type: String, trim: true }, // the wallet number, for mobile money
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paymentRef: String,
    deliveredAt: Date,
    paidAt: Date,
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });
orderSchema.index({ soldBy: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);