import Report from "../models/Report.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { archiveListingById } from "./listing.service.js";
import { HttpError } from "../middleware/error.middleware.js";

// Any logged-in user can report
export async function createReport(user, data) {
  let ownerId;
  if (data.targetType === "listing") {
    const listing = await Listing.findById(data.targetId);
    if (!listing) throw new HttpError(404, "Listing not found");
    ownerId = listing.seller.toString();
  } else {
    const target = await User.findById(data.targetId);
    if (!target) throw new HttpError(404, "User not found");
    ownerId = target._id.toString();
  }

  if (ownerId === user._id.toString()) {
    throw new HttpError(400, "You cannot report yourself");
  }

  const duplicate = await Report.findOne({
    reporter: user._id,
    targetType: data.targetType,
    targetId: data.targetId,
    status: "open",
  });
  if (duplicate) throw new HttpError(409, "You already reported this");

  return Report.create({ ...data, reporter: user._id });
}

export async function listReports(q) {
  const filter = { status: q.status };
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate("reporter", "name email"),
    Report.countDocuments(filter),
  ]);

  const idsOf = (type) => reports.filter((r) => r.targetType === type).map((r) => r.targetId);
  const [listings, users] = await Promise.all([
    Listing.find({ _id: { $in: idsOf("listing") } })
      .select("title status seller")
      .populate("seller", "name sellerProfile.shopName"),
    User.find({ _id: { $in: idsOf("user") } }).select("name email status"),
  ]);
  const listingById = new Map(listings.map((l) => [l._id.toString(), l]));
  const userById = new Map(users.map((u) => [u._id.toString(), u]));

  const items = reports.map((r) => {
    const obj = r.toObject();
    const id = r.targetId.toString();
    if (r.targetType === "listing") {
      const l = listingById.get(id);
      obj.target = l
        ? {
          kind: "listing",
          title: l.title,
          status: l.status,
          sellerName: l.seller?.sellerProfile?.shopName || l.seller?.name,
        }
        : null;
    } else {
      const u = userById.get(id);
      obj.target = u ? { kind: "user", name: u.name, email: u.email, status: u.status } : null;
    }
    return obj;
  });

  return { items, page: q.page, total, pages: Math.ceil(total / q.limit) };
}
export async function resolveReport(admin, id, { status, adminNote, removeTarget }) {
  const report = await Report.findById(id);
  if (!report) throw new HttpError(404, "Report not found");
  if (report.status !== "open") throw new HttpError(400, "Report already handled");

  if (status === "resolved" && removeTarget && report.targetType === "listing") {
    await archiveListingById(report.targetId);
  }

  report.status = status;
  report.adminNote = adminNote;
  report.handledBy = admin._id;
  await report.save();
  return report;
}