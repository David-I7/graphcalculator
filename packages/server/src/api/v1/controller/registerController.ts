import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/SimpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";

const handleEmailVerification = async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "register",
            "Email is of invalid format."
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

export default { handleEmailVerification };
