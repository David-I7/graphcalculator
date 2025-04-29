import { Request, Response } from "express";
import { UserDao } from "../db/dao/userDao.js";
import { ApiErrorResponse } from "../services/apiResponse/errorResponse.js";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { isEmail, isValidPassword } from "../services/validation/auth.js";
import { PasswordService } from "../services/passwordService.js";
import { OAuthStore } from "../services/oAuth/tokenStore.js";
import { DeletedUsersDao } from "../db/dao/deletedUsersDao.js";

const handleEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "register",
            "Invalid credentials.",
            400
          )
        )
      );
    return;
  }

  const userDao = new UserDao();
  const user = await userDao.findUserByColumnName("email", email, ["provider"]);
  res
    .status(200)
    .json(
      new ApiSuccessResponse().createResponse(
        user
          ? { isRegistered: true, provider: user.provider }
          : { isRegistered: false }
      )
    );
};

const handleRegister = async (req: Request, res: Response) => {
  const userDao = new UserDao();

  const { token } = req.body;
  if (OAuthStore.hasData(token)) {
    const data = OAuthStore.getData(token)!;

    const user = await userDao.upsertUserFromProvider({
      email: data.payload.email || "",
      first_name: data.payload.given_name || "",
      last_name: data.payload.family_name || "",
      email_is_verified: data.payload.email_verified || false,
      provider: data.tokens.provider,
    });

    await new DeletedUsersDao().revokeScheduledDeleteIfExists(user.id);

    req.session.user = user;
    req.session.tokens = data.tokens;

    res
      .status(200)
      .json(new ApiSuccessResponse().createResponse({ user: user }));
    return;
  }

  const { email, first_name, last_name, password } = req.body;
  if (!email || !isEmail(email) || !first_name || !isValidPassword(password)) {
    res
      .status(400)
      .json(
        new ApiErrorResponse().createResponse(
          new SimpleErrorFactory().createClientError(
            "register",
            "Invalid credentials.",
            400
          )
        )
      );
    return;
  }

  const hashedPassword = await new PasswordService().hash(password);

  const user = await userDao.upsertUser({
    email,
    first_name,
    last_name,
    password: hashedPassword,
  });

  req.session.user = user;
  res.status(200).json(new ApiSuccessResponse().createResponse({ user }));
};

export default { handleEmailVerification, handleRegister };
