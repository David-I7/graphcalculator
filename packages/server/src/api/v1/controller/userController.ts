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
import { JWTService } from "../services/jwt/jwtService.js";
import { clientDirname } from "../constants.js";
import path from "path";
import { isValidPassword } from "../services/validation/auth.js";
import { PasswordService } from "../services/passwordService.js";
import { ResetPasswordTemplate } from "../services/email/template/resetPasswordTemplate.js";
import { VerifyCodeTemplate } from "../services/email/template/verifyCodeTemplate.ts.js";

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

const handleDeleteUser = async (req: Request, res: Response) => {
  const userId = req.jwtPayload!.userId as string;

  const deletedUserDao = new DeletedUsersDao();

  const isScheduled = await deletedUserDao.scheduleDelete(userId);
  if (!isScheduled) {
    res.sendStatus(500);
    return;
  }

  isScheduled
    ? res.sendFile(path.join(clientDirname, "/deleteResponse.html"))
    : res.sendStatus(500);
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
      .html(new VerifyCodeTemplate(code.code).createTemplate());

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

export const verifyEmailCode = async (req: Request, res: Response) => {
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

  if (typeof password !== "number" || password !== 1) {
    res.sendStatus(400);
    return;
  }

  const emailService = new GoogleEmailService();
  const token = await new JWTService().sign({ userId: req.session.user!.id });
  try {
    const message = emailService.getDefaultMessageBuilder();
    message
      .to(req.session.user!.email)
      .subject("Change your password")
      .html(new ResetPasswordTemplate(token).createTemplate());

    await emailService.sendEmail(message);

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const handleResetPasswordView = async (req: Request, res: Response) => {
  res.sendFile(path.join(clientDirname, "/resetPassword.html"));
};

const verifyResetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const userId = req.jwtPayload!.userId as string;

  if (!isValidPassword(password)) {
    res.sendStatus(400);
    return;
  }

  const hashedPassword = await new PasswordService().hash(password);
  const userDao = new UserDao();

  if (await userDao.updateUserById(userId, ["password"], [hashedPassword])) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
};

export default {
  handleUpdateUserCredentials,
  handleDeleteUser,
  verifyEmail,
  verifyEmailCode,
  handleReset,
  handleResetPasswordView,
  verifyResetPassword,
};
