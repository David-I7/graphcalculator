import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/SimpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";

const handleAuthStatus = (req: Request, res: Response) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
    return;
  }

  res.sendStatus(401);
};

const handleAuth = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userDao = new UserDao();
  const user = await userDao.findUserByEmail(email, ["email", "password"]);

  if (!user) {
    res
      .status(404)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError("auth", "User not found.")
        )
      );
    return;
  }

  if (password === user?.password) {
    res.status(200).json(new ApiSuccessResponse().createResponse({ user }));
  } else {
    res
      .status(403)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "auth",
            "Incorrect password."
          )
        )
      );
  }
};

export default { handleAuthStatus, handleAuth };
