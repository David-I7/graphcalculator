import { NextFunction, Request, Response } from "express";
import { isClientError } from "../services/error/clientError.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";

export const errorController = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isClientError(err)) {
    res.status(403).json(new ApiErrorResponse().createResponse(err));
    return;
  }

  console.log(err);
  res.sendStatus(500);
};
