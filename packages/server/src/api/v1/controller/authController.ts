import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/utlis.js";
import { PasswordService } from "../services/passwordService.js";
import { hasSession } from "../middleware/session.js";

const handleAuthStatus = (req: Request, res: Response) => {
  if (hasSession(req)) {
    res.status(200).json(req.session.user);
    return;
  }

  res.sendStatus(401);
};

const handleAuth = async (req: Request, res: Response) => {
  if (hasSession(req)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "auth",
            "Already logged in."
          )
        )
      );
    return;
  }

  const { email, password } = req.body;
  if (!email || !isEmail(email) || !isValidPassword(password)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "auth",
            "Invalid credentials."
          )
        )
      );
    return;
  }

  const userDao = new UserDao();
  const user = await userDao.findUserByEmail(email);

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

  if (await new PasswordService().compare(password, user.password)) {
    // @ts-ignore
    delete user.password;
    req.session.user = user;
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
