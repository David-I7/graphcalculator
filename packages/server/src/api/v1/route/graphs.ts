import { Router } from "express";
import graphController from "../controller/graphController.js";
import upload from "../middleware/fileStorage.js";
import { SessionService } from "../services/SessionService.js";

const graphRouter = Router();

graphRouter.get("/examples", graphController.handleExampleGraphs);
graphRouter
  .route("/saved")
  .get(
    new SessionService().validateSession(),
    graphController.handleGetSavedGraphs
  )
  .put(
    new SessionService().validateSession(),
    upload.single("image"),
    graphController.handlePutSavedGraphs
  )
  .delete(
    new SessionService().validateSession(),
    graphController.handelDeleteSavedGraph
  );

export default graphRouter;
