import { Router } from "express";
import graphController from "../controller/graphController.js";
import upload from "../middleware/fileStorage.js";
import { SessionService } from "../services/sessionService.js";

const graphRouter = Router();

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
