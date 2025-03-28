import { Router } from "express";
import graphController from "../controller/graphController.js";

const graphs = Router();

graphs.get("/examples", graphController.handleExampleGraphs);
graphs.route("/saved").get(graphController.handleGetSavedGraphs);

export default graphs;
