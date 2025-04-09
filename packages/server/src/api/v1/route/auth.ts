import { Router } from "express";
import authController from "../controller/authController.js";

const authRouter = Router();

authRouter.get("/status", authController.handleAuthStatus);
authRouter.post("/", authController.handleAuth);
authRouter.get("/google", authController.handleOAuth2);
authRouter.get("/google/callback", authController.handleOAuth2Callback);

export default authRouter;
