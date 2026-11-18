import * as reviewService from "../services/review.service.js";

export const create = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user, req.body);
    res.status(201).json({ review, message: "Thank you for your review" });
  } catch (err) {
    next(err);
  }
};

export const mine = async (req, res, next) => {
  try {
    res.json({ reviews: await reviewService.getMyReviews(req.user) });
  } catch (err) {
    next(err);
  }
};