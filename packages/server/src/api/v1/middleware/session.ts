import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "../services/oAuth/OAuthClient.js";
import { OAuth2StrategyFactory } from "../services/oAuth/StrategyFactory.js";
import { valueCompare } from "../helpers/objects.js";

export function hasSession(req: Request) {
  return req?.session?.user !== undefined;
}

export async function rollingSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (hasSession(req)) {
    if (req.session.tokens) {
      const { expiry_date, refresh_token } = req.session.tokens;
      const client = new OAuth2Client();
      client.setStrategy(
        new OAuth2StrategyFactory().createStrategy(req.session.tokens.provider)
      );

      if (client.isExpiredAccessToken(expiry_date)) {
        const token = await client.refreshAccessToken(refresh_token);

        if (!token) {
          // refresh_token has expired asumption => destroy session
          req.session.destroy((err) => {
            if (err) next(err);
            next();
          });
        } else {
          const data = await client.getTokenPayload(token.id_token!);

          console.log(
            valueCompare(
              [
                data.email,
                data.family_name,
                data.given_name,
                data.email_verified,
              ],
              [
                req.session.user!.email,
                req.session.user!.last_name,
                req.session.user!.first_name,
                req.session.user!.email_is_verified,
              ]
            )
          );
        }
      }
    }
  }
}

export function verifySession(req: Request, res: Response, next: NextFunction) {
  if (!hasSession(req)) {
    res.sendStatus(401);
    return;
  }
  next();
}
