import * as listingService from "../services/listing.service.js";

export const create = async (req, res, next) => {
  try {
    const listing = await listingService.createListing(req.user, req.body, req.file);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
};

export const browse = async (req, res, next) => {
  try {
    res.json(await listingService.browseListings(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    res.json({ listing: await listingService.getListingById(req.params.id) });
  } catch (err) {
    next(err);
  }
};

export const mine = async (req, res, next) => {
  try {
    res.json({ listings: await listingService.getMyListings(req.user, req.validatedQuery.status) });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(req.user, req.params.id, req.body, req.file);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await listingService.archiveListing(req.user, req.params.id);
    res.json({ message: "Listing removed" });
  } catch (err) {
    next(err);
  }
};