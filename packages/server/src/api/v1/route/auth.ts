import { Router } from "express";
import authController from "../controller/authController.js";
import { SessionService } from "../services/SessionService.js";
import { UserRolesEnum } from "@graphcalculator/types";

const authRouter = Router();

authRouter.get(
  "/status",
  new SessionService().rollingSession(),
  authController.handleAuthStatus,
);
authRouter.post(
  "/",
  new SessionService().isAuthenticated(),
  authController.handleAuth,
);
authRouter.get("/google", authController.handleOAuth2);
authRouter.get("/google/callback", authController.handleOAuth2Callback);
authRouter.get("/email/callback", authController.handleEmailCallback);
authRouter.get(
  "/email",
  new SessionService().verifyRoles(UserRolesEnum.ADMIN),
  authController.handleEmail,
);
authRouter.delete(
  "/email/token",
  new SessionService().verifyRoles(UserRolesEnum.ADMIN),
  authController.handleDeleteEmailTokens,
);

export default authRouter;
