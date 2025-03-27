import { Router } from "express";
import graphController from "../controller/graphController.js";

const graphs = Router();

graphs.get("/examples", graphController.handleExampleGraphs);

export default graphs;
