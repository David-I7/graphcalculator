import { Router } from "express";
import userController from "../controller/userController.js";
import { SessionService } from "../services/sessionService.js";
import { JWTService } from "../services/jwt/jwtService.js";

const userRouter = Router();

userRouter
  .route("/account")
  .patch(
    new SessionService().validateSession(),
    userController.handleUpdateUserCredentials
  )
  .get(
    new JWTService().verifyUrlToken("deleteToken"),
    userController.handleDeleteUser
  );

userRouter
  .route("/account/reset")
  .post(new SessionService().validateSession(), userController.handleReset);

userRouter
  .route("/account/reset/password")
  .get(
    new JWTService().verifyUrlToken("resetToken"),
    userController.handleResetPasswordView
  )
  .post(
    new JWTService().verifyBearerToken(),
    userController.verifyResetPassword
  );

userRouter
  .get(
    "/verify/email",
    new SessionService().validateSession(),
    userController.verifyEmail
  )
  .post(
    "/verify/email",
    new SessionService().validateSession(),
    userController.verifyEmailCode
  );

export default userRouter;
