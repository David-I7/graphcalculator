import { Router } from "express";
import logoutController from "../controller/logoutController.js";

const logoutRouter = Router();

logoutRouter.get("/", logoutController.handleLogout);

export default logoutRouter;
