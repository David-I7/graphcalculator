import { NextFunction, Request, Response } from "express";
import { hasSession } from "../middleware/session.js";
import { cookieOptions } from "../config/cookies.js";

const handleLogout = (req: Request, res: Response, next: NextFunction) => {
  if (!hasSession(req)) {
    res.sendStatus(400);
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.clearCookie("sid", {
      ...cookieOptions,
      maxAge: 0,
      expires: undefined,
    });
    res.sendStatus(200);
  });
};

export default { handleLogout };
