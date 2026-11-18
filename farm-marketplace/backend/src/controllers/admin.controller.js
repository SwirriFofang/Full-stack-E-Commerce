import * as admin from "../services/admin.service.js";
import * as reports from "../services/report.service.js";

export const users = async (req, res, next) => {
  try {
    res.json(await admin.listUsers(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const setUserStatus = async (req, res, next) => {
  try {
    res.json({ user: await admin.setUserStatus(req.user, req.params.id, req.body.status) });
  } catch (err) {
    next(err);
  }
};

export const verifySeller = async (req, res, next) => {
  try {
    res.json({ user: await admin.setSellerVerified(req.params.id, req.body.verified) });
  } catch (err) {
    next(err);
  }
};

export const listings = async (req, res, next) => {
  try {
    res.json(await admin.listAllListings(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const removeListing = async (req, res, next) => {
  try {
    res.json({ listing: await admin.removeListing(req.params.id) });
  } catch (err) {
    next(err);
  }
};

export const stats = async (req, res, next) => {
  try {
    res.json({ stats: await admin.getStats() });
  } catch (err) {
    next(err);
  }
};

export const listReports = async (req, res, next) => {
  try {
    res.json(await reports.listReports(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    res.json({ report: await reports.resolveReport(req.user, req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
};

export const orders = async (req, res, next) => {
  try {
    res.json({ orders: await admin.listPlatformOrders(req.validatedQuery) });
  } catch (err) {
    next(err);
  }
};