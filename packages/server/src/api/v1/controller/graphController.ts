import { Request, Response } from "express";
import exampleGraphs from "../model/examples.json" with { type: "json" };
import savedGraphs from "../model/saved.json" with {type : "json"}

const handleExampleGraphs = (req: Request, res: Response) => {
  res.status(200).json(exampleGraphs);
};

const handleGetSavedGraphs = (req: Request, res: Response) => {
  const graphs =  savedGraphs["1"]
  
  res.status(200).json(graphs)
   return
}

export default { handleExampleGraphs,handleGetSavedGraphs };
