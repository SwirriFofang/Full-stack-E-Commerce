import * as productService from "../services/product.service.js";

export const list = async (req, res, next) => {
  try {
    res.json(await productService.browseProducts(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const preview = async (req, res, next) => {
  try {
    res.json(await productService.previewProducts(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};