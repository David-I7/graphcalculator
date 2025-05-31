import { Router } from "express";
import graphRouter from "./graphs.js";
import authRouter from "./auth.js";
import registerRouter from "./register.js";
import logoutRouter from "./logout.js";
import userRouter from "./user.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = Router();

router.use("/api/graphs", graphRouter);
router.use("/api/auth", authRouter);
router.use("/api/register", registerRouter);
router.use("/api/logout", logoutRouter);
router.use("/api/user", userRouter);

router.use(errorHandler);

export default router;
