import * as orderService from "../services/order.service.js";

export const create = async (req, res, next) => {
  try {
    const orders = await orderService.createOrder(req.user, req.body);
    res.status(201).json({ orders });
  } catch (err) {
    next(err);
  }
};

export const mine = async (req, res, next) => {
  try {
    res.json({ orders: await orderService.getMyOrders(req.user) });
  } catch (err) {
    next(err);
  }
};

export const selling = async (req, res, next) => {
  try {
    res.json({ orders: await orderService.getSellerOrders(req.user, req.validatedQuery.status) });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    res.json({ order: await orderService.getOrder(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
};

export const pay = async (req, res, next) => {
  try {
    const order = await orderService.payOrder(req.user, req.params.id);
    res.json({ message: "Payment done", order });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(req.user, req.params.id, req.body.status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    res.json({ order: await orderService.cancelOrder(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
};


export const received = async (req, res, next) => {
  try {
    res.json({ order: await orderService.confirmReceived(req.user, req.params.id) });
  } catch (err) {
    next(err);
  }
};