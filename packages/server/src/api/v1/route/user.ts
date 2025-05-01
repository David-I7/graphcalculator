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
  .get(new JWTService().verify(), userController.handleDeleteUser);

userRouter
  .route("/account/reset")
  .get(new SessionService().validateSession(), userController.handleReset);

userRouter
  .route("/account/reset/password")
  .get(new JWTService().verify(), userController.handleResetPasswordView)
  .post(new JWTService().verify(), userController.verifyResetPassword);

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
