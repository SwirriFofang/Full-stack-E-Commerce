import jwt from "jsonwebtoken";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id, roles: user.roles }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export const refreshCookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};