import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "../services/oAuth/OAuthClient.js";
import { OAuth2StrategyFactory } from "../services/oAuth/StrategyFactory.js";
import { valueCompare } from "../helpers/objects.js";
import { cookieOptions } from "../config/cookies.js";
import { UserDao } from "../db/dao/userDao.js";
import { SessionData } from "express-session";

export function hasSession(req: Request) {
  return req?.session?.user !== undefined;
}

export async function rollingSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!hasSession(req)) {
    next();
  }

  //STORE REFRESH TOKEN IN USER TABLE SINCE GOOGLE WON'T ISSUE AN NEW REFRESH TOKEN IF
  //USER HAS A REFRESH TOKEN ALREADY

  if (req.session.tokens) {
    const { expiry_date, refresh_token } = req.session.tokens;
    const client = new OAuth2Client();
    client.setStrategy(
      new OAuth2StrategyFactory().createStrategy(req.session.tokens.provider)
    );

    if (!client.isExpiredAccessToken(expiry_date)) {
      next();
      return;
    }

    try {
      const tokens = await client.refreshAccessToken(refresh_token);

      if (!tokens) throw new Error("Invalid refresh token");
      else {
        const userInfo = await client.getUserInfo(tokens.access_token!);

        if (
          !valueCompare(
            [
              userInfo.family_name,
              userInfo.given_name,
              userInfo.email_verified,
            ],
            [
              req.session.user!.last_name,
              req.session.user!.first_name,
              req.session.user!.email_is_verified,
            ]
          )
        ) {
          const userDao = new UserDao();
          userDao.updateUserById(
            req.session.user!.id,
            ["last_name", "first_name", "email_is_verified"],
            [userInfo.family_name, userInfo.given_name, userInfo.email_verified]
          );
        }

        saveSession(req, res, next, undefined, {
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token!,
          provider: req.session.tokens.provider,
          expiry_date: tokens.expiry_date!,
        });
      }
    } catch (err) {
      // refresh_token has expired asumption => destroy session
      req.session.destroy((err) => {
        if (err) next(err);
        next();
      });
    }
  } else {
    saveSession(req, res, next);
  }
}

function saveSession(
  req: Request,
  res: Response,
  next: NextFunction,
  user?: SessionData["user"],
  tokens?: SessionData["tokens"]
) {
  if (user) {
    req.session.user = user;
  }
  if (tokens) {
    req.session.tokens = tokens;
  }

  req.session.save((err) => {
    res.cookie("sid", req.cookies.sid, cookieOptions);
    next();
  });
}

export function verifySession(req: Request, res: Response, next: NextFunction) {
  if (!hasSession(req)) {
    res.sendStatus(401);
    return;
  }
  next();
}
