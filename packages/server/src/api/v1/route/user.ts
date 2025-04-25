import { Router } from "express";
import userController from "../controller/userController.js";

const userRouter = Router();

userRouter
  .route("/")
  .patch(userController.handleUpdateUserCredentials)
  .delete(userController.handleDelete);

userRouter.get("/verify/email", userController.verifyEmail);

export default userRouter;
