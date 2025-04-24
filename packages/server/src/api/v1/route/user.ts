import { Router } from "express";
import userController from "../controller/userController.js";

const userRouter = Router();

userRouter
  .route("/")
  .patch(userController.handleUpdateUserCredentials)
  .delete(userController.handleDelete);

export default userRouter;
