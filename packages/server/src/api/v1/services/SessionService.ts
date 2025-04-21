import { NextFunction, Request, Response } from "express";
import { OpenIDClient } from "./oAuth/OAuthClient.js";
import { OpenIDStrategyFactory } from "./oAuth/strategyFactory.js";
import { valueCompare } from "../helpers/objects.js";
import { cookieOptions } from "../config/cookies.js";
import { SessionData } from "express-session";
import { ApiErrorResponse } from "./apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "./error/simpleErrorFactory.js";
import { UserDao } from "../db/dao/userDao.js";

export class SessionService {
  hasSession(req: Request) {
    return req?.session?.user !== undefined;
  }

  rollingSession() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.hasSession(req)) {
        next();
        return;
      }

      if (req.session.tokens) {
        const { expiry_date, refresh_token } = req.session.tokens;
        const client = new OpenIDClient();

        if (!client.isExpiredAccessToken(expiry_date)) {
          next();
          return;
        }

        client.setStrategy(
          new OpenIDStrategyFactory().createStrategy(
            req.session.tokens.provider
          )
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
                [
                  userInfo.family_name,
                  userInfo.given_name,
                  userInfo.email_verified,
                ]
              );

              this.updateSession(
                req,
                {
                  ...req.session.user!,
                  last_name: userInfo.family_name,
                  first_name: userInfo.given_name!,
                  email_is_verified: userInfo.email_verified!,
                },
                { ...req.session.tokens, access_token }
              );
              this.saveRollingSession(req, res, next);
              return;
            }

            this.updateSession(req, undefined, {
              ...req.session.tokens,
              access_token,
            });
            this.saveRollingSession(req, res, next);
          }
        } catch (err) {
          // refresh_token has expired asumption => destroy session
          req.session.destroy((err) => {
            if (err) next(err);
            next();
          });
        }
      } else {
        this.saveRollingSession(req, res, next);
      }
    };
  }

  updateSession(
    req: Request,
    user?: SessionData["user"],
    tokens?: SessionData["tokens"]
  ) {
    if (user) {
      req.session.user = user;
    }
    if (tokens) {
      req.session.tokens = tokens;
    }
  }

  private saveRollingSession(req: Request, res: Response, next: NextFunction) {
    // using save because touch does not work.
    // optimistic update, worst case the browser expiration will
    // be greater than my db expiration which prompts a new login
    req.session.save();
    res.cookie("sid", req.cookies.sid, cookieOptions);
    next();
  }

  validateSession() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.hasSession(req)) {
        res.sendStatus(401);
        return;
      }

      next();
    };
  }

  isAuthenticated() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (this.hasSession(req)) {
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
    };
  }
}
