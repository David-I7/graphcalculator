import { Router } from "express";
import authController from "../controller/authController.js";
import { SessionService } from "../services/sessionService.js";

const authRouter = Router();

authRouter.get(
  "/status",
  new SessionService().rollingSession(),
  authController.handleAuthStatus
);
authRouter.post(
  "/",
  new SessionService().isAuthenticated(),
  authController.handleAuth
);
authRouter.get("/google", authController.handleOAuth2);
authRouter.get("/google/callback", authController.handleOAuth2Callback);
authRouter.get("/email/callback", authController.handleEmailCallback);
authRouter.get("/email", authController.handleEmail);

export default authRouter;
