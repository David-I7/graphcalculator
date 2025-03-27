import { Request, Response } from "express";
import exampleGraphs from "../model/examples.json" assert { type: "json" };

const handleExampleGraphs = (req: Request, res: Response) => {
  // res.setHeader("cache-control", "public,max-age=60000,must-revalidate");
  res.status(200).json(exampleGraphs);
};

export default { handleExampleGraphs };
