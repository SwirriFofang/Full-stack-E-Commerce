import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Order from "../models/Order.js";
import Report from "../models/Report.js";
import { archiveListingById } from "./listing.service.js";
import { HttpError } from "../middleware/error.middleware.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listUsers(q) {
  const filter = {};
  if (q.q) {
    const rx = { $regex: escapeRegex(q.q), $options: "i" };
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (q.role) filter.roles = q.role;
  if (q.status) filter.status = q.status;
  if (q.verified) filter["sellerProfile.verified"] = q.verified === "true";

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name email phone roles status sellerProfile createdAt")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    User.countDocuments(filter),
  ]);
  return { items, page: q.page, total, pages: Math.ceil(total / q.limit) };
}

async function findManageableUser(admin, id) {
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, "User not found");
  if (user._id.toString() === admin._id.toString()) {
    throw new HttpError(400, "You cannot change your own account here");
  }
  if (user.roles.includes("admin")) {
    throw new HttpError(403, "Admin accounts cannot be changed here");
  }
  return user;
}

export async function setUserStatus(admin, id, status) {
  const user = await findManageableUser(admin, id);
  user.status = status;
  await user.save();

  const now = new Date();
  if (status === "suspended") {
    // Hide their listings from the public
    await Listing.updateMany(
      { seller: user._id, status: { $in: ["active", "sold_out", "expired"] } },
      { $set: { status: "suspended" } }
    );
  } else {
    // Restore the ones that are still valid
    await Listing.updateMany(
      { seller: user._id, status: "suspended", expiresAt: { $gt: now }, quantityAvailable: { $gt: 0 } },
      { $set: { status: "active" } }
    );
    await Listing.updateMany(
      { seller: user._id, status: "suspended", expiresAt: { $gt: now }, quantityAvailable: 0 },
      { $set: { status: "sold_out" } }
    );
    await Listing.updateMany(
      { seller: user._id, status: "suspended", expiresAt: { $lte: now } },
      { $set: { status: "expired" } }
    );
  }
  return user;
}

export async function setSellerVerified(id, verified) {
  const user = await User.findById(id);
  if (!user || !user.roles.includes("seller") || !user.sellerProfile) {
    throw new HttpError(404, "Seller not found");
  }
  user.sellerProfile.verified = verified;
  await user.save();
  return user;
}

export async function listAllListings(q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.q) filter.title = { $regex: escapeRegex(q.q), $options: "i" };

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate("seller", "name email sellerProfile.shopName"),
    Listing.countDocuments(filter),
  ]);
  return { items, page: q.page, total, pages: Math.ceil(total / q.limit) };
}

export async function removeListing(id) {
  const listing = await Listing.findById(id);
  if (!listing) throw new HttpError(404, "Listing not found");
  await archiveListingById(id);
  return Listing.findById(id);
}

export async function getStats() {
  const [users, sellers, pendingSellers, activeListings, orders, openReports, platformOrdersToHandle, sales] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: "seller" }),
      User.countDocuments({ roles: "seller", "sellerProfile.verified": false }),
      Listing.countDocuments({ status: "active", expiresAt: { $gt: new Date() } }),
      Order.countDocuments(),
      Report.countDocuments({ status: "open" }),
      Order.countDocuments({
        soldBy: "platform",
        status: { $in: ["pending", "confirmed", "packed", "out_for_delivery"] },
      }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
    ]);

  return {
    users,
    sellers,
    pendingSellers,
    activeListings,
    orders,
    openReports,
    platformOrdersToHandle,
    paidOrders: sales[0]?.count || 0,
    totalSales: sales[0]?.total || 0,
  };
}

// Orders for FarmFresh's own catalogue items, which only an admin can handle
export async function listPlatformOrders(q) {
  const filter = { soldBy: "platform" };
  if (q.status) filter.status = q.status;
  return Order.find(filter).sort({ createdAt: -1 }).limit(200).populate("buyer", "name phone email");
}