import * as reportService from "../services/report.service.js";

export const create = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user, req.body);
    res.status(201).json({ report, message: "Report sent. Thank you." });
  } catch (err) {
    next(err);
  }
};