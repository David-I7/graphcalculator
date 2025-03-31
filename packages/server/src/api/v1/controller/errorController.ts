import { NextFunction, Request, Response } from "express";
import { ManagedError } from "../services/ErrorFactoryService.js";
import { ApiResponseService } from "../services/ApiResponseService.js";

export const errorController = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ManagedError) {
    res.status(403).json(ApiResponseService.createErrorResponse(err));
    return;
  }

  console.log(err);
  res.sendStatus(500);
};
