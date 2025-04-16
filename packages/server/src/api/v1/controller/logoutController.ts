import { NextFunction, Request, Response } from "express";
import { cookieOptions } from "../config/cookies.js";
import { GoogleOAuth2Strategy } from "../services/oAuth/googleStrategy.js";
import { OAuth2Client } from "../services/oAuth/OAuthClient.js";

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.tokens && req.session.tokens.refresh_token) {
    const client = new OAuth2Client();
    client.setStrategy(new GoogleOAuth2Strategy());
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
