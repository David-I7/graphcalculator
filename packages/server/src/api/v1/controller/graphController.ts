import { Request, Response } from "express";
import exampleGraphs from "../model/examples.json" with { type: "json" };
import savedGraphs from "../model/saved.json" with {type : "json"}

const handleExampleGraphs = (req: Request, res: Response) => {
  res.cookie("test","server",{
    maxAge: 1000 * 60 * 5,
    // "httpOnly": true,
    secure: true,
    sameSite: "none",
    domain: "localhost"
  })
  res.cookie("test2","server2",{
    maxAge: 1000 * 60 * 5,
    // "httpOnly": true,
    secure: true,
    sameSite: "none",
     domain: "localhost"
  })
  res.status(200).json(exampleGraphs);
};

const handleGetSavedGraphs = (req: Request, res: Response) => {
  res.header("set-cookie","test=serverval; max-age=100")
   res.sendStatus(401)
   return
}

export default { handleExampleGraphs,handleGetSavedGraphs };
