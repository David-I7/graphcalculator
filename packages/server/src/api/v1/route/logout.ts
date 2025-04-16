import { Router } from "express";
import logoutController from "../controller/logoutController.js";
import { SessionService } from "../services/SessionService.js";

const logoutRouter = Router();

logoutRouter.get(
  "/",
  new SessionService().validateSession(),
  logoutController.handleLogout
);

export default logoutRouter;
