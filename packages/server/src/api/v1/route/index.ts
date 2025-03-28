import { Router } from "express";
import rootController from "../controller/rootController.js";
import graphsRoute from "./graphs.js";
import { errorController } from "../controller/errorController.js";
import { serverDirname } from "../constants.js";
import path from "path";

const router = Router();

router.get("/", rootController);
router.use("/api/graphs", graphsRoute);
router.all("*", (req, res) => {
  res.sendFile(path.join(serverDirname, "/view/notFound.html"));
});
router.use(errorController);

export default router;
