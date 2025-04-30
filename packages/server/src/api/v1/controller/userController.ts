import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { Provider, UserSessionData } from "@graphcalculator/types";
import { SessionService } from "../services/sessionService.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { DeletedUsersDao } from "../db/dao/deletedUsersDao.js";
import { GoogleEmailService } from "../services/email/emailService.js";
import { WeakCodeService } from "../services/cache/static/weakCodeService.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { VerifyEmailTemplate } from "../services/email/template/verify/verifyEmailTemplate.js";
import { StrongCodeService } from "../services/cache/static/strongCodeService.js";
import { DeleteCodeResponseTemplate } from "../services/email/template/delete/deleteCodeResponseTemplate.js";
import { ResetPasswordTemplate } from "../services/email/template/reset/resetPasswordTemplate.js";

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
            "Failed to save, please try again.",
            500
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
  const { deleteToken } = req.query;

  if (typeof deleteToken !== "string") {
    res.sendStatus(400);
    return;
  }

  const service = new StrongCodeService<UserSessionData["id"]>();
  const result = service.validate(deleteToken, deleteToken);

  if ("message" in result) {
    res.sendStatus(403);
    return;
  } else {
    const code = result;

    const deletedUserDao = new DeletedUsersDao();

    const isScheduled = await deletedUserDao.scheduleDelete(code.data);
    if (!isScheduled) {
      res.sendStatus(500);
      return;
    }

    isScheduled
      ? res.send(new DeleteCodeResponseTemplate().createTemplate())
      : res.sendStatus(500);
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email_is_verified, email } = req.session.user!;

  if (email_is_verified) {
    res.sendStatus(400);
    return;
  }

  const emailService = new GoogleEmailService();
  try {
    const codeService = new WeakCodeService();
    const code = codeService.generateCode(undefined);
    codeService.set(req.session.user!.id, code);
    const message = emailService.getDefaultMessageBuilder();
    message
      .to(email)
      .subject("Verify your email address")
      .html(new VerifyEmailTemplate(code.code).createTemplate());

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

export const verifyCode = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (typeof code != "string" || code.length !== 6) {
    res.sendStatus(400);
    return;
  }

  const result = new WeakCodeService().validate(code, req.session.user!.id);

  if ("message" in result) {
    res.status(401).json(new ApiErrorResponse().createResponse(result));
  } else {
    const userDao = new UserDao();

    const updated = await userDao.updateUserById(
      req.session.user!.id,
      ["email_is_verified"],
      [true]
    );
    if (!updated) {
      res.sendStatus(500);
      return;
    }

    const sessionService = new SessionService();
    const userSessionData: UserSessionData = {
      ...req.session.user!,
      email_is_verified: true,
    };
    sessionService.updateSession(req.session, { user: userSessionData });

    res
      .status(200)
      .json(new ApiSuccessResponse().createResponse({ user: userSessionData }));
    return;
  }
};

const handleReset = async (req: Request, res: Response) => {
  const { password } = req.body;

  if (typeof password !== "string" && password !== "1") {
    res.sendStatus(400);
    return;
  }

  const emailService = new GoogleEmailService();
  const service = new StrongCodeService<UserSessionData["id"]>();
  const code = service.generateCode(req.session.user!.id);
  service.set(code.code, code);
  try {
    const message = emailService.getDefaultMessageBuilder();
    message
      .to(req.session.user!.email)
      .subject("Change your password")
      .html(new ResetPasswordTemplate(code.code).createTemplate());

    await emailService.sendEmail(message);

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

  res.sendStatus(200);
};

const verifyResetCode = async (req: Request, res: Response) => {
  const { resetToken } = req.query;

  if (typeof resetToken !== "string") {
    res.sendStatus(400);
    return;
  }

  const result = new StrongCodeService().validate(resetToken, resetToken);

  if ("message" in result) {
    res.sendStatus(403);
    return;
  } else {
  }
};

export default {
  handleUpdateUserCredentials,
  handleDelete,
  verifyEmail,
  verifyCode,
  handleReset,
  verifyResetCode,
};
