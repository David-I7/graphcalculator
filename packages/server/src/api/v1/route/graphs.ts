import { Router } from "express";
import graphController from "../controller/graphController.js";
import { validateSession } from "../middleware/session.js";

const graphRouter = Router();

graphRouter.get("/examples", graphController.handleExampleGraphs);
graphRouter
  .route("/saved")
  .get(validateSession, graphController.handleGetSavedGraphs);

export default graphRouter;
