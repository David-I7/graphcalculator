import { NextFunction, Request, Response } from "express";
import { SessionService } from "../services/sessionService.js";

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionService = new SessionService();
  const isDeleted = await sessionService.deleteSession(req, res);

  if (isDeleted) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
};

export default { handleLogout };
