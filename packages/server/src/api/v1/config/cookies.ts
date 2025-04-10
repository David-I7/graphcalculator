import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  sameSite: "strict",
  secure: process.env.NODE_ENV !== "development",
  maxAge: 60000 * 60 * 24 * 7 * 3, // ~3 months
  httpOnly: true,
  path: "/",
};
