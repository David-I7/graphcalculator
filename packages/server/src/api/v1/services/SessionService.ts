import { NextFunction, Request, Response } from "express";
import { OpenIDClient } from "./oAuth/OAuthClient.js";
import { OpenIDStrategyFactory } from "./oAuth/strategyFactory.js";
import { valueCompare } from "../helpers/objects.js";
import { cookieOptions } from "../config/cookies.js";
import { ApiErrorResponse } from "./apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "./error/simpleErrorFactory.js";
import { UserDao } from "../db/dao/userDao.js";
import { Provider, UserRolesEnum } from "@graphcalculator/types";
import { Session, SessionData } from "express-session";
import DB from "../db/index.js";

export type SessionObject = Session & Partial<SessionData>;

export class SessionService {
  hasSession(req: Request) {
    return req?.session?.user !== undefined;
  }

  private async revokeRefreshToken(provider: Provider, refresh_token: string) {
    const client = new OpenIDClient();
    client.setStrategy(new OpenIDStrategyFactory().createStrategy(provider));
    return await client.revokeRefreshToken(refresh_token);
  }

  async deleteSession(
    session: SessionObject,
    onDelete: () => void
  ): Promise<boolean> {
    return new Promise(async (resolve, rej) => {
      if (session.tokens) {
        throw new Error(
          "Sessions from other providers must be all deleted recursively since all tokens will get invalidated"
        );
      }

      session.destroy((err) => {
        if (err) {
          rej(false);
          return;
        }
        onDelete();
        return resolve(true);
      });
    });
  }

  async deleteSessionRecursive(
    userId: string,
    onDelete: () => void
  ): Promise<boolean> {
    try {
      const sessions = (
        await DB.query<{ refresh_token: string; provider: number }>(
          `delete from session where sess#>>'{user,id}' = $1
          returning sess#>>'{tokens,refresh_token}' as refresh_token, (sess#>>'{tokens,provider}')::int as provider`,
          [userId]
        )
      ).rows;

      const queue = sessions.filter((sess) => {
        return sess.provider !== Provider.graphCalculator;
      });

      const requests = Array.from({ length: 4 }, async () => {
        while (queue.length) {
          const credentials = queue.pop()!;
          try {
            await this.revokeRefreshToken(
              credentials.provider,
              credentials.refresh_token
            );
          } catch (err) {
            return false;
          }
        }
        return true;
      });

      await Promise.allSettled(requests);
      onDelete();
      return true;
    } catch (err) {
      return false;
    }
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
          const refreshed = await client.refreshAccessToken(refresh_token);

          if (!refreshed || !refreshed.access_token)
            throw new Error("Invalid refresh token");
          else {
            const userInfo = await client.getUserInfo(refreshed.access_token);

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

              this.updateSession(req.session, {
                user: {
                  ...req.session.user!,
                  last_name: userInfo.family_name,
                  first_name: userInfo.given_name!,
                  email_is_verified: userInfo.email_verified!,
                },
                tokens: { ...req.session.tokens, ...refreshed },
              });
              this.saveRollingSession(req, res, next);
              return;
            }

            this.updateSession(req.session, {
              tokens: {
                ...req.session.tokens,
                ...refreshed,
              },
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
    session: SessionObject,
    updated: {
      user?: SessionData["user"];
      tokens?: SessionData["tokens"];
    }
  ) {
    if (updated.user) {
      session.user = updated.user;
    }
    if (updated.tokens) {
      session.tokens = updated.tokens;
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
                "Already logged in.",
                400
              )
            )
          );
        return;
      }

      next();
    };
  }

  verifyRoles(...allowedRoles: UserRolesEnum[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (
        !this.hasSession(req) ||
        !allowedRoles.includes(req.session.user?.role as any)
      ) {
        res
          .status(403)
          .json(
            new ApiErrorResponse().createResponse(
              new SimpleErrorFactory().createClientError(
                "auth",
                "You do not have the required permissions to access this resource",
                403
              )
            )
          );
        return;
      }

      next();
    };
  }
}
