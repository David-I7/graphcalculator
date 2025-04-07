import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  sameSite: "strict",
  secure: process.env.NODE_ENV !== "development",
  maxAge: 60000 * 10,
  httpOnly: true,
  path: "/",
};
