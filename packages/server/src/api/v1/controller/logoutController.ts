import { NextFunction, Request, Response } from "express";
import { hasSession } from "../middleware/session.js";
import { cookieOptions } from "../config/cookies.js";
import { oAuth2Client } from "../services/oAuth/googleStrategy.js";

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!hasSession(req)) {
    res.sendStatus(400);
    return;
  }

  if (req.session.tokens) {
    oAuth2Client
      .revokeToken(req.session.tokens.refresh_token)
      .then((res) => console.log("SUCCESS TOKEN REVOKE: ", res))
      .catch((err) => console.log("FAIL TOKEN REVOKE: ", err));
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
