import * as accountService from "../services/account.service.js";

export const listAddresses = (req, res) => {
  res.json({ addresses: accountService.listAddresses(req.user) });
};

export const addAddress = async (req, res, next) => {
  try {
    res.status(201).json({ addresses: await accountService.addAddress(req.user, req.body) });
  } catch (err) {
    next(err);
  }
};

export const removeAddress = async (req, res, next) => {
  try {
    res.json({ addresses: await accountService.removeAddress(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    res.json({ user: await accountService.updateProfile(req.user, req.body) });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await accountService.changePassword(req.user, req.body);
    res.json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
};