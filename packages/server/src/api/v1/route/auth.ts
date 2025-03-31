import { Router } from "express";
import authController from "../controller/authController.js";

const authRouter = Router();

authRouter.get("/status", authController.handleAuthStatus);

export default authRouter;
