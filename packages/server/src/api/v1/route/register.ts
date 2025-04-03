import { Router } from "express";
import registerController from "../controller/registerController.js";

const registerRouter = Router();

registerRouter.post("/verify", registerController.handleEmailVerification);
registerRouter.post("/", registerController.handleRegister);

export default registerRouter;
