import * as authService from "../services/auth.service.js";
import { refreshCookieOptions } from "../utils/tokens.js";

const sendSession = (res, session, status = 200) => {
  res.cookie("refreshToken", session.refreshToken, refreshCookieOptions);
  res.status(status).json({ user: session.user, accessToken: session.accessToken });
};

export const register = async (req, res, next) => {
  try {
    sendSession(res, await authService.registerUser(req.body), 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    sendSession(res, await authService.loginUser(req.body));
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    sendSession(res, await authService.refreshSession(req.cookies.refreshToken));
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
};

export const me = (req, res) => {
  res.json({ user: authService.getPublicUser(req.user) });
};

export const becomeSeller = async (req, res, next) => {
  try {
    sendSession(res, await authService.becomeSeller(req.user, req.body));
  } catch (err) {
    next(err);
  }
};