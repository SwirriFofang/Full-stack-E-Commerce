import mongoose from "mongoose";
import Order from "../models/Order.js";
import Listing from "../models/Listing.js";
import CatalogItem from "../models/CatalogItem.js";
import { HttpError } from "../middleware/error.middleware.js";
import { processPayment } from "./payment.service.js";
import Review from "../models/Review.js";

const NEXT_STATUS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["out_for_delivery"], // a pickup order now waits here for the buyer
  out_for_delivery: [],
  delivered: [],
  cancelled: [],
};

const POPULATE = [
  { path: "buyer", select: "name phone" },
  { path: "seller", select: "name sellerProfile.shopName" },
];

// FarmFresh's own delivery fee for catalogue items (FCFA). Set it when you decide.
const PLATFORM_DELIVERY_FEE = 0;

const sumItems = (items) => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

async function makeOrder(buyer, sellerId, items, deliveryFee, details, session) {
  const { fulfilment, address, contact, payment, note } = details;
  const itemsTotal = sumItems(items);
  const [order] = await Order.create(
    [
      {
        buyer: buyer._id,
        seller: sellerId || undefined,
        soldBy: sellerId ? "seller" : "platform",
        items,
        itemsTotal,
        deliveryFee,
        total: itemsTotal + deliveryFee,
        fulfilment,
        address: fulfilment === "delivery" ? address : undefined,
        contactName: contact.name,
        contactPhone: contact.phone,
        note,
        paymentMethod: payment.method,
        paymentPhone: payment.method === "bank_transfer" ? undefined : payment.phone,
      },
    ],
    { session }
  );
  return order;
}

// Checkout: one order per seller plus one FarmFresh order, all in one transaction
export async function createOrder(buyer, { items, fulfilment, address, contact, payment, note }) {
  const details = { fulfilment, address, contact, payment, note };
  // Merge duplicates: the same product and size twice becomes one line
  const wanted = new Map();
  for (const it of items) {
    const key =
      it.source === "catalog" ? `catalog:${it.itemId}:${it.variantId}` : `listing:${it.itemId}`;
    if (wanted.has(key)) wanted.get(key).quantity += it.quantity;
    else wanted.set(key, { ...it });
  }

  const session = await mongoose.startSession();
  let created = [];

  try {
    await session.withTransaction(async () => {
      created = [];
      const bySeller = new Map();
      const platformItems = [];

      for (const line of wanted.values()) {
        // Catalogue item: the price and size come from the database, not from the browser
        if (line.source === "catalog") {
          const item = await CatalogItem.findById(line.itemId).session(session);
          const variant = item?.variants.id(line.variantId);
          if (!item || !variant) {
            throw new HttpError(404, "An item in your basket is no longer sold");
          }
          platformItems.push({
            source: "catalog",
            catalogItem: item._id,
            title: item.name,
            unitPrice: variant.price,
            quantity: line.quantity,
            unit: variant.label,
          });
          continue;
        }

        // Seller listing: reduce stock only if it is active, unexpired, in stock and not the buyer's own
        const listing = await Listing.findOneAndUpdate(
          {
            _id: line.itemId,
            status: "active",
            expiresAt: { $gt: new Date() },
            quantityAvailable: { $gte: line.quantity },
            seller: { $ne: buyer._id },
          },
          { $inc: { quantityAvailable: -line.quantity } },
          { new: true, session }
        );

        if (!listing) {
          const existing = await Listing.findById(line.itemId).session(session);
          if (!existing) throw new HttpError(404, "An item in your basket no longer exists");
          if (existing.seller.toString() === buyer._id.toString()) {
            throw new HttpError(400, "You cannot buy your own listing");
          }
          throw new HttpError(409, `"${existing.title}" is not available in that quantity`);
        }

        if (fulfilment === "delivery" && !listing.delivery?.delivery) {
          throw new HttpError(400, `"${listing.title}" does not offer delivery`);
        }

        if (listing.quantityAvailable === 0) {
          listing.status = "sold_out";
          await listing.save({ session });
        }

        const key = listing.seller.toString();
        if (!bySeller.has(key)) bySeller.set(key, []);
        bySeller.get(key).push({ listing, quantity: line.quantity });
      }

      for (const [sellerId, lines] of bySeller) {
        const orderItems = lines.map(({ listing, quantity }) => ({
          source: "listing",
          listing: listing._id,
          title: listing.title,
          unitPrice: listing.price,
          quantity,
          unit: listing.unit,
        }));
        const deliveryFee =
          fulfilment === "delivery"
            ? Math.max(...lines.map((l) => l.listing.delivery?.fee || 0))
            : 0;
                created.push(await makeOrder(buyer, sellerId, orderItems, deliveryFee, details, session));
      }

      if (platformItems.length) {
        const fee = fulfilment === "delivery" ? PLATFORM_DELIVERY_FEE : 0;
                created.push(await makeOrder(buyer, null, platformItems, fee, details, session));
      }
    });
  } finally {
    await session.endSession();
  }

  return created;
}

export async function getMyOrders(user) {
  const orders = await Order.find({ buyer: user._id }).sort({ createdAt: -1 }).populate(POPULATE);
  const reviews = await Review.find({
    reviewer: user._id,
    order: { $in: orders.map((o) => o._id) },
  }).select("order");
  const reviewed = new Set(reviews.map((r) => r.order.toString()));
  return orders.map((o) => ({ ...o.toObject(), reviewed: reviewed.has(o._id.toString()) }));
}
export const getSellerOrders = (user, status) => {
  const filter = { seller: user._id };
  if (status) filter.status = status;
  return Order.find(filter).sort({ createdAt: -1 }).populate(POPULATE);
};

export async function getOrder(user, id) {
  const order = await Order.findById(id).populate(POPULATE);
  if (!order) throw new HttpError(404, "Order not found");
  const uid = user._id.toString();
  const allowed =
    order.buyer._id.toString() === uid ||
    order.seller?._id.toString() === uid ||
    user.roles.includes("admin");
  if (!allowed) throw new HttpError(403, "This is not your order");
  return order;
}

// Mock payment: only the buyer, only once, not on a cancelled order
export async function payOrder(user, id) {
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found");
  if (order.buyer.toString() !== user._id.toString()) {
    throw new HttpError(403, "This is not your order");
  }
  if (order.status === "cancelled") throw new HttpError(400, "Order is cancelled");
  if (order.paymentStatus === "paid") throw new HttpError(400, "Order already paid");

  const { reference, paidAt } = await processPayment(order);
  order.paymentStatus = "paid";
  order.paymentRef = reference;
  order.paidAt = paidAt;
  await order.save();
  return order;
}

// The seller moves their order forward. FarmFresh orders are moved by an admin.
// The seller (or the admin, for FarmFresh orders) moves an order forward. The buyer completes it.
export async function updateStatus(user, id, status) {
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found");

  const allowed = order.seller
    ? order.seller.toString() === user._id.toString()
    : user.roles.includes("admin");
  if (!allowed) throw new HttpError(403, "This is not your order");

  if (!NEXT_STATUS[order.status].includes(status)) {
    throw new HttpError(400, `Cannot move from ${order.status} to ${status}`);
  }
  if (status === "cancelled") return cancelAndRestock(order);
  if (status === "out_for_delivery" && order.fulfilment !== "delivery") {
    throw new HttpError(400, "This is a pickup order");
  }

  order.status = status;
  await order.save();
  return order;
}

// Buyer may cancel only while pending
export async function cancelOrder(user, id) {
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found");
  if (order.buyer.toString() !== user._id.toString()) {
    throw new HttpError(403, "This is not your order");
  }
  if (order.status !== "pending") {
    throw new HttpError(400, "Only pending orders can be cancelled. Contact the seller.");
  }
  return cancelAndRestock(order);
}

async function cancelAndRestock(order) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        if (item.source === "catalog") continue; // catalogue items have no stock to return

        await Listing.updateOne(
          { _id: item.listing },
          { $inc: { quantityAvailable: item.quantity } },
          { session }
        );
        // A sold-out listing that has not expired becomes available again
        await Listing.updateOne(
          { _id: item.listing, status: "sold_out", expiresAt: { $gt: new Date() } },
          { $set: { status: "active" } },
          { session }
        );
      }
      order.status = "cancelled";
      if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return order;
}

// A pickup order waits at "packed" for the buyer. A delivery order waits at "out_for_delivery".
const awaitingBuyer = (order) =>
  (order.fulfilment === "pickup" && order.status === "packed") ||
  (order.fulfilment === "delivery" && order.status === "out_for_delivery");

// The buyer confirms they collected or received the order
export async function confirmReceived(user, id) {
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found");
  if (order.buyer.toString() !== user._id.toString()) {
    throw new HttpError(403, "This is not your order");
  }
  if (!awaitingBuyer(order)) {
    throw new HttpError(400, "This order is not ready to be confirmed yet");
  }

  order.status = "delivered";
  order.deliveredAt = new Date();
  await order.save();
  return order;
}

// If the buyer never confirms, the order completes by itself after this many days
const AUTO_COMPLETE_DAYS = 7;

export async function autoCompleteOrders() {
  const cutoff = new Date(Date.now() - AUTO_COMPLETE_DAYS * 24 * 60 * 60 * 1000);
  const result = await Order.updateMany(
    {
      updatedAt: { $lte: cutoff },
      $or: [
        { fulfilment: "pickup", status: "packed" },
        { fulfilment: "delivery", status: "out_for_delivery" },
      ],
    },
    { $set: { status: "delivered", deliveredAt: new Date() } }
  );
  return result.modifiedCount;
}
