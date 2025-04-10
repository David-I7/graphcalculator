import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/utlis.js";
import { PasswordService } from "../services/passwordService.js";
import { hasSession } from "../middleware/session.js";
import { oAuth2Client } from "../services/oAuth/googleStrategy.js";
import { OAuth2StrategyFactory } from "../services/oAuth/StrategyFactory.js";
import { OAuthStore } from "../services/oAuth/tokenStore.js";
import { randomUUID } from "node:crypto";
import { provider } from "../constants.js";

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

const handleOAuth2 = async (req: Request, res: Response) => {
  // const strategy = req.query.strategy;

  // if (typeof strategy !== "string") {
  //   res.sendStatus(400);
  //   return;
  // }

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);

  // const client = new OAuth2StrategyFactory().createStrategy(strategy);
  // if(!client){
  //   res.sendStatus(400);
  //   return;
  // }
};

const handleOAuth2Callback = async (req: Request, res: Response) => {
  const code = req.query.code;

  if (typeof code !== "string") {
    res.sendStatus(500);
    return;
  }

  try {
    const response = await oAuth2Client.getToken(code);
    console.log("\n\nTOKENS: ", response.tokens);
    response.tokens;

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: response.tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;
    console.log("\n\nPAYLOAD: ", payload);

    const token = randomUUID();
    OAuthStore.setData(token, {
      tokens: {
        access_token: response.tokens.access_token!,
        refresh_token: response.tokens.refresh_token!,
        provider: provider["google"],
      },
      payload,
    });

    res.send(`
    <script>
      window.opener.postMessage({ type: "oauth_success", token: "${token}" }, "http://localhost:3000");
      window.close()
    </script>
  `);
  } catch (error) {
    console.log("\n\nCODE ERROR: ", error);
    res.send(`
    <script>
      window.opener.postMessage({ type: "oauth_error" }, "http://localhost:3000");
      window.close()
    </script>
  `);
  }
};

export default {
  handleAuthStatus,
  handleAuth,
  handleOAuth2,
  handleOAuth2Callback,
};
