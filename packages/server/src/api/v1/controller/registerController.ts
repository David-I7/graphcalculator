import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/SimpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/utlis.js";
import { hashPassword } from "../services/password.js";

const handleEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "register",
            "Invalid credentials."
          )
        )
      );
    return;
  }

  const userDao = new UserDao();
  const isRegistered = await userDao.existsEmail(email);
  res
    .status(200)
    .json(new ApiSuccessResponse().createResponse({ isRegistered }));
};

const handleRegister = async (req: Request, res: Response) => {
  const { email, firstName, lastName, password } = req.body;
  if (!email || !isEmail(email) || !firstName || !isValidPassword(password)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "register",
            "Invalid credentials."
          )
        )
      );
    return;
  }

  const userDao = new UserDao();
  const hashedPassword = await hashPassword(password);
  console.log(hashedPassword.length, hashedPassword);
  const user = await userDao.createUser({
    email,
    first_name: firstName,
    last_name: lastName,
    password: hashedPassword,
  });

  res.status(200).json(new ApiSuccessResponse().createResponse(user));
};

export default { handleEmailVerification, handleRegister };
