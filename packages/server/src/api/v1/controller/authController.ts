import { Request, Response } from "express";
import { UserDao } from "../db/DAO/UserDao.js";
import { ApiResponseService } from "../services/ApiResponseService.js";

const handleAuthStatus = (req: Request, res: Response) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
    return;
  }

  res.sendStatus(401);
};

export default { handleAuthStatus };
