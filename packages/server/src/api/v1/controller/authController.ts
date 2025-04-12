import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/auth.js";
import { PasswordService } from "../services/passwordService.js";
import { GoogleOAuth2Strategy } from "../services/oAuth/googleStrategy.js";
import { OAuth2Client } from "../services/oAuth/OAuthClient.js";
import { OAuthReponseTemplate } from "../services/oAuth/ResponseTemplate.js";
import { hasSession } from "../middleware/session.js";

const handleAuthStatus = (req: Request, res: Response) => {
  if (hasSession(req)) {
    res
      .status(200)
      .json(
        new ApiSuccessResponse().createResponse({ user: req.session.user })
      );
    return;
  }

  res.sendStatus(401);
};

const handleAuth = async (req: Request, res: Response) => {
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

const handleOAuth2 = async (req: Request, res: Response) => {
  const client = new OAuth2Client();
  client.setStrategy(new GoogleOAuth2Strategy());

  const url = client.generateAuthUrl();
  res.redirect(url);
};

const handleOAuth2Callback = async (req: Request, res: Response) => {
  const code = req.query.code;

  if (typeof code !== "string") {
    res.sendStatus(500);
    return;
  }

  const client = new OAuth2Client();
  client.setStrategy(new GoogleOAuth2Strategy());
  const responseTemplate = new OAuthReponseTemplate();

  try {
    const token = await client.saveToStore(code);

    responseTemplate.setMessage({ type: "oauth_success", token });
    res.send(responseTemplate.createTemplate());
  } catch (error) {
    responseTemplate.setMessage({ type: "oauth_error" });
    res.send(responseTemplate.createTemplate());
  }
};

export default {
  handleAuthStatus,
  handleAuth,
  handleOAuth2,
  handleOAuth2Callback,
};
