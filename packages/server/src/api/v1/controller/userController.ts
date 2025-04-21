import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { UserSessionData } from "@graphcalculator/types";
import { SessionService } from "../services/sessionService.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";

const handleUpdateUserCredentials = async (req: Request, res: Response) => {
  if (req.session.user?.provider !== 0) {
    res.sendStatus(400);
    return;
  }

  const { first_name, last_name } = req.body;
  if (typeof first_name !== "string" || typeof last_name !== "string") {
    res.sendStatus(400);
    return;
  }

  const userDao = new UserDao();
  const dbres = await userDao.updateUserById(
    req.session.user.id,
    ["first_name", "last_name"],
    [first_name, last_name]
  );

  if (!dbres) {
    res
      .status(500)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createServerError(
            "db",
            "Failed to save, please try again."
          )
        )
      );
    return;
  }

  const newSessionData: UserSessionData = {
    ...req.session.user,
    first_name,
    last_name,
  };

  new SessionService().updateSession(req, newSessionData);
  res
    .status(200)
    .json(new ApiSuccessResponse().createResponse({ user: newSessionData }));
  return;
};

export default { handleUpdateUserCredentials };
