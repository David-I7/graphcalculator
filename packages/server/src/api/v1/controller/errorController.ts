import { NextFunction, Request, Response } from "express";
import { ManagedErrorImpl } from "../services/ErrorFactory.js";

export const errorController = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ManagedErrorImpl) {
    switch (err.type) {
      case "cors":
        res.status(403).json({
          error: {
            message: err.message,
            type: err.type,
            code: err.code,
          },
        });
        return;
    }
  }

  res.sendStatus(500);
};
