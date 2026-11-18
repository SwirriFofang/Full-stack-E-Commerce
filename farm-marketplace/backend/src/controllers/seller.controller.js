import * as sellerService from "../services/seller.service.js";

export const stats = async (req, res, next) => {
  try {
    res.json({ stats: await sellerService.getSellerStats(req.user) });
  } catch (err) {
    next(err);
  }
};