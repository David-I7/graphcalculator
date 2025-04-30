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

  verify() {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.headers.authorization);
      const auth = req.headers.authorization?.split(" ");

      if (!auth || auth.length !== 2) {
        res.sendStatus(400);
        return;
      }

      const token = auth[1].trim();

      Jwt.verify(token, this.secret, (err, payload) => {
        if (err) {
          console.log(err);
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
    options: Jwt.SignOptions
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
