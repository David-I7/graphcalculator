import { Router } from "express";
import graphController from "../controller/graphController.js";
import { validateSession } from "../middleware/session.js";
import upload from "../middleware/fileStorage.js";

const graphRouter = Router();

graphRouter.get("/examples", graphController.handleExampleGraphs);
graphRouter
  .route("/saved")
  .get(validateSession, graphController.handleGetSavedGraphs)
  .put(
    validateSession,
    upload.single("image"),
    graphController.handlePutSavedGraphs
  );

export default graphRouter;
