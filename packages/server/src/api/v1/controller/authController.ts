import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/SimpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/utlis.js";
import { isHashedPassword } from "../services/password.js";

const handleAuthStatus = (req: Request, res: Response) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
    return;
  }

  res.sendStatus(401);
};

const handleAuth = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !isValidPassword(password)) {
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

  if (!isEmail(email)) {
    res
      .status(401)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "auth",
            "Invalid email address."
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

  if (await isHashedPassword(password, user.password)) {
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
