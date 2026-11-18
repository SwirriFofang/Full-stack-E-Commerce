import mongoose from "mongoose";
import { HttpError } from "./error.middleware.js";

export const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new HttpError(400, "Invalid id"));
  }
  next();
};