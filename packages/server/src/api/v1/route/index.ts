import { Router } from "express";
import rootController from "../controller/rootController.js";
import graphRouter from "./graphs.js";
import authRouter from "./auth.js";
import { clientDirname } from "../constants.js";
import path from "path";
import registerRouter from "./register.js";
import logoutRouter from "./logout.js";
import userRouter from "./user.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", rootController);
router.use("/api/graphs", graphRouter);
router.use("/api/auth", authRouter);
router.use("/api/register", registerRouter);
router.use("/api/logout", logoutRouter);
router.use("/api/user", userRouter);
router.all("*", (req, res) => {
  res.sendFile(path.join(clientDirname, "/notFound.html"));
});
router.use(errorHandler);

export default router;
