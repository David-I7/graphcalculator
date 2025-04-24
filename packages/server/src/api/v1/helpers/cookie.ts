import { Response } from "express";
import { cookieOptions } from "../config/cookies.js";

export function deleteCookie(res: Response) {
  res.clearCookie("sid", {
    ...cookieOptions,
    maxAge: 0,
    expires: undefined,
  });
}
