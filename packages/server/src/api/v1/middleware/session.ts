import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "../services/oAuth/OAuthClient.js";
import { OAuth2StrategyFactory } from "../services/oAuth/StrategyFactory.js";
import { valueCompare } from "../helpers/objects.js";
import { cookieOptions } from "../config/cookies.js";
import { UserDao } from "../db/dao/userDao.js";
import { SessionData } from "express-session";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";

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
    return;
  }

  if (req.session.tokens) {
    const { expiry_date, refresh_token } = req.session.tokens;
    const client = new OAuth2Client();

    if (!client.isExpiredAccessToken(expiry_date)) {
      next();
      return;
    }

    client.setStrategy(
      new OAuth2StrategyFactory().createStrategy(req.session.tokens.provider)
    );

    try {
      const access_token = await client.refreshAccessToken(refresh_token);

      if (!access_token) throw new Error("Invalid refresh token");
      else {
        const userInfo = await client.getUserInfo(access_token);

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

          saveSession(
            req,
            res,
            next,
            {
              ...req.session.user!,
              last_name: userInfo.family_name,
              first_name: userInfo.given_name!,
              email_is_verified: userInfo.email_verified!,
            },
            { ...req.session.tokens, access_token }
          );
          return;
        }

        saveSession(req, res, next, undefined, {
          ...req.session.tokens,
          access_token,
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

  // optimistic update, worst case the browser expiration will
  // be greater than my db expiration which prompts a new login
  req.session.save();
  res.cookie("sid", req.cookies.sid, cookieOptions);
  next();
}

export function validateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!hasSession(req)) {
    res.sendStatus(401);
    return;
  }

  next();
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (hasSession(req)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "auth",
            "Already logged in."
          )
        )
      );
    return;
  }

  next();
}
