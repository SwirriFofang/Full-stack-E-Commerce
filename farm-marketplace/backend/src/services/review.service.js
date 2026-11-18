import Review from "../models/Review.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { HttpError } from "../middleware/error.middleware.js";

// Recalculate the seller's average from all their reviews
async function refreshSellerRating(sellerId) {
  const [stats] = await Review.aggregate([
    { $match: { seller: sellerId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await User.updateOne(
    { _id: sellerId },
    {
      $set: {
        "sellerProfile.ratingAvg": Math.round((stats?.avg || 0) * 10) / 10,
        "sellerProfile.ratingCount": stats?.count || 0,
      },
    }
  );
}

export async function createReview(user, { orderId, rating, comment }) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError(404, "Order not found");
  if (order.buyer.toString() !== user._id.toString()) {
    throw new HttpError(403, "This is not your order");
  }
  if (!order.seller) throw new HttpError(400, "FarmFresh orders cannot be reviewed yet");
  if (order.status !== "delivered") {
    throw new HttpError(400, "You can review an order after it is delivered");
  }
  if (await Review.exists({ order: order._id })) {
    throw new HttpError(409, "You already reviewed this order");
  }

  const review = await Review.create({
    order: order._id,
    reviewer: user._id,
    seller: order.seller,
    rating,
    comment,
  });
  await refreshSellerRating(order.seller);
  return review;
}

export const getMyReviews = (user) =>
  Review.find({ reviewer: user._id })
    .sort({ createdAt: -1 })
    .populate("seller", "name sellerProfile.shopName")
    .populate("order", "items total createdAt");