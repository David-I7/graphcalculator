import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { Provider, UserSessionData } from "@graphcalculator/types";
import { SessionService } from "../services/sessionService.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { DeletedUsersDao } from "../db/dao/deletedUsersDao.js";
import { GoogleEmailService } from "../services/email/emailService.js";

const handleUpdateUserCredentials = async (req: Request, res: Response) => {
  if (req.session.user?.provider !== Provider.graphCalulator) {
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

  new SessionService().updateSession(req.session, { user: newSessionData });
  res
    .status(200)
    .json(new ApiSuccessResponse().createResponse({ user: newSessionData }));
  return;
};

const handleDelete = async (req: Request, res: Response) => {
  const deletedUserDao = new DeletedUsersDao();

  const isScheduled = await deletedUserDao.scheduleDelete(req.session.user!.id);
  if (!isScheduled) {
    res.sendStatus(500);
    return;
  }

  const sessionService = new SessionService();
  const isDeleted = await sessionService.deleteSessionRecursive(
    req.session.user!.id
  );

  isDeleted ? res.sendStatus(200) : res.sendStatus(500);
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email_is_verified, email } = req.session.user!;

  if (email_is_verified) {
    res.sendStatus(400);
    return;
  }

  const emailService = new GoogleEmailService();
  const sessionService = new SessionService();
  try {
    const code = sessionService.generateSessionCode();
    sessionService.updateSession(req.session, {
      tmp: { ...req.session.tmp, [req.session.user!.id]: { code } },
    });
    const message = emailService.getDefaultMessageBuilder();
    message
      .to(email)
      .subject("Verify your email address")
      .html(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email address</title>
        </head>
        <body>
          <h1>Verification code</h1>
          <b>${code}</b>
        </body>
        </html>
      `
      );

    const sent = await emailService.sendEmail(message);
    if (!sent) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export default { handleUpdateUserCredentials, handleDelete, verifyEmail };
