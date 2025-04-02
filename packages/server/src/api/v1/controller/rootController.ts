import path from "path";
import { clientDirname } from "../constants.js";
import { Request, Response } from "express";

const rootController = (req: Request, res: Response) => {
  res.sendFile(path.join(clientDirname, "index.html"));
};

export default rootController;
