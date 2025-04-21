import { NextFunction, Request, Response } from "express";
import { cookieOptions } from "../config/cookies.js";
import { GoogleOpenIDStrategy } from "../services/oAuth/googleStrategy.js";
import { OpenIDClient } from "../services/oAuth/OAuthClient.js";

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.tokens && req.session.tokens.refresh_token) {
    const client = new OpenIDClient();
    client.setStrategy(new GoogleOpenIDStrategy());
    client.revokeRefreshToken(req.session.tokens.refresh_token);
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
