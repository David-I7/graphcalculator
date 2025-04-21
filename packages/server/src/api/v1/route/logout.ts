import { Router } from "express";
import logoutController from "../controller/logoutController.js";
import { SessionService } from "../services/sessionService.js";

const logoutRouter = Router();

logoutRouter.get(
  "/",
  new SessionService().validateSession(),
  logoutController.handleLogout
);

export default logoutRouter;
