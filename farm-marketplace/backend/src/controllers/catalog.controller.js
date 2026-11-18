import * as catalogService from "../services/catalog.service.js";

export const list = async (req, res, next) => {
  try {
    res.json(await catalogService.listCatalog(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const item = await catalogService.createCatalogItem(req.body, req.file);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    res.json({ item: await catalogService.updateCatalogItem(req.params.id, req.body, req.file) });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await catalogService.deleteCatalogItem(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    next(err);
  }
};