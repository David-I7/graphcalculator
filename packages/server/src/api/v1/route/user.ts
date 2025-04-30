import { Router } from "express";
import userController from "../controller/userController.js";
import { SessionService } from "../services/sessionService.js";

const userRouter = Router();

userRouter
  .route("/account")
  .patch(
    new SessionService().validateSession(),
    userController.handleUpdateUserCredentials
  )
  .get(userController.handleDelete);

userRouter
  .route("/account/reset")
  .patch(new SessionService().validateSession(), userController.handleReset)
  .post(userController.verifyResetCode);

userRouter
  .get(
    "/verify/email",
    new SessionService().validateSession(),
    userController.verifyEmail
  )
  .post(
    "/verify/email",
    new SessionService().validateSession(),
    userController.verifyCode
  );

export default userRouter;
