import { Router } from "express";
import userController from "../controller/userController.js";
import { SessionService } from "../services/sessionService.js";

const userRouter = Router();

userRouter
  .route("/")
  .patch(
    new SessionService().validateSession(),
    userController.handleUpdateUserCredentials
  )
  .get(userController.handleDelete);

userRouter
  .get(
    "/verify/email",
    new SessionService().validateSession(),
    userController.verifyEmail
  )
  .post(
    "/verify/code",
    new SessionService().validateSession(),
    userController.verifyCode
  );

export default userRouter;
