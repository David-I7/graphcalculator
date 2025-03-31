import { Router } from "express";
import graphController from "../controller/graphController.js";

const graphRouter = Router();

graphRouter.get("/examples", graphController.handleExampleGraphs);
graphRouter.route("/saved").get(graphController.handleGetSavedGraphs);

export default graphRouter;
