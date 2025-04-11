import { Router } from "express";
import authController from "../controller/authController.js";
import { rollingSession } from "../middleware/session.js";

const authRouter = Router();

authRouter.get("/status", rollingSession, authController.handleAuthStatus);
authRouter.post("/", authController.handleAuth);
authRouter.get("/google", authController.handleOAuth2);
authRouter.get("/google/callback", authController.handleOAuth2Callback);

export default authRouter;
