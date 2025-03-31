import { Router } from "express";
import rootController from "../controller/rootController.js";
import graphRouter from "./graphs.js";
import authRouter from "./auth.js";
import { errorController } from "../controller/errorController.js";
import { serverDirname } from "../constants.js";
import path from "path";
import testRouter from "./test.js";
import registerRouter from "./register.js";

const router = Router();

router.get("/", rootController);
router.use("/api/graphs", graphRouter);
router.use("/api/auth", authRouter);
router.use("/api/register", registerRouter);
router.use("/api/test", testRouter);
router.all("*", (req, res) => {
  res.sendFile(path.join(serverDirname, "/view/notFound.html"));
});
router.use(errorController);

export default router;
