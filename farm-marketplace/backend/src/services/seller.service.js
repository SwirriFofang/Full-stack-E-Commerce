import Listing from "../models/Listing.js";
import Order from "../models/Order.js";

const LOW_STOCK = 5;

export async function getSellerStats(user) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [listingCounts, orderCounts, earnings, lowStock] = await Promise.all([
    Listing.aggregate([
      { $match: { seller: user._id, status: { $ne: "archived" } } },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { seller: user._id } },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { seller: user._id, paymentStatus: "paid", status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          month: { $sum: { $cond: [{ $gte: ["$paidAt", monthStart] }, "$total", 0] } },
        },
      },
    ]),
    Listing.find({
      seller: user._id,
      status: "active",
      expiresAt: { $gt: now },
      quantityAvailable: { $lte: LOW_STOCK },
    })
      .sort({ quantityAvailable: 1 })
      .limit(5)
      .select("title quantityAvailable unit"),
  ]);

  const countOf = (rows, key) => rows.find((r) => r._id === key)?.n || 0;

  return {
    activeListings: countOf(listingCounts, "active"),
    soldOutListings: countOf(listingCounts, "sold_out"),
    expiredListings: countOf(listingCounts, "expired"),
    newOrders: countOf(orderCounts, "pending"),
    toDeliver:
      countOf(orderCounts, "confirmed") + countOf(orderCounts, "packed") + countOf(orderCounts, "out_for_delivery"),
    monthEarnings: earnings[0]?.month || 0,
    totalEarnings: earnings[0]?.total || 0,
    lowStock,
  };
}