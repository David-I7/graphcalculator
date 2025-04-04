import { NextFunction, Request, Response } from "express";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";

export function hasSession(req: Request) {
  return req?.session?.user !== undefined;
}

export function verifySession(req: Request, res: Response, next: NextFunction) {
  if (!hasSession(req)) {
    res.sendStatus(401);
    return;
  }
  next();
}
