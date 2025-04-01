import { Request, Response } from "express";
import { UserDao } from "../db/DAO/UserDao.js";
import { ApiResponseService } from "../services/ApiResponseService.js";
import { ERROR_MESSAGES } from "../constants.js";
import { ManagedErrorFactory } from "../services/ErrorFactoryService.js";

const handleEmailVerification = async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) {
    res
      .status(400)
      .json(
        ApiResponseService.createErrorResponse(
          ManagedErrorFactory.makeError(
            "register",
            ERROR_MESSAGES.register.invalidEmail
          )
        )
      );
    return;
  }

  const userDao = new UserDao();

  const isRegistered = await userDao.existsEmail(email);
  res
    .status(200)
    .json(ApiResponseService.createSuccessResponse({ isRegistered }));
};

export default { handleEmailVerification };
