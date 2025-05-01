import { NextFunction, Request, Response } from "express";
import { CredentialsFactory } from "../config/credentialsFactory.js";
import Jwt, { JwtPayload } from "jsonwebtoken";

declare module "express" {
  interface Request {
    jwtPayload?: JwtPayload & Record<string, any>;
  }
}

export class JWTService {
  private secret: string;
  private opt: Jwt.SignOptions = {
    expiresIn: 60 * 10, // 10 mins
  };
  constructor() {
    this.secret = new CredentialsFactory().getJWTSecret();
  }

  verifyUrlToken(tokenName: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = req.query[tokenName];

      if (typeof token !== "string") {
        res.sendStatus(400);
        return;
      }

      Jwt.verify(token, this.secret, (err, payload) => {
        if (err) {
          res.sendStatus(403);
          return;
        }
        req.jwtPayload = payload as JwtPayload;
        next();
      });
    };
  }

  verifyBearerToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization?.split(" ");

      if (!auth || auth.length !== 2 || auth[0] !== "bearer") {
        res.sendStatus(400);
        return;
      }

      const token = auth[1];

      Jwt.verify(token, this.secret, (err, payload) => {
        if (err) {
          res.sendStatus(403);
          return;
        }
        req.jwtPayload = payload as JwtPayload;
        next();
      });
    };
  }

  async sign(
    payload: string | Buffer | object,
    options?: Jwt.SignOptions
  ): Promise<string> {
    return new Promise((res, rej) => {
      Jwt.sign(
        payload,
        this.secret,
        { ...this.opt, ...options },
        (err, token) => {
          if (err) rej(err);
          res(token!);
        }
      );
    });
  }
}
