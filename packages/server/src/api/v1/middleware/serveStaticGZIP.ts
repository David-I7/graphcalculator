import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { clientDirname } from "../constants.js";

export default function serveStaticGZIP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let extension: string = path.extname(req.url);

  if (extension === ".js" || extension === ".css") {
    req.originalUrl = req.originalUrl.concat(".gz");
    res.setHeader("cache-control", "public, max-age=60000, must-revalidate");
    res.setHeader("content-encoding", "gzip");

    res.setHeader(
      "content-type",
      `text/${extension == ".js" ? "javascript" : "css"}`
    );

    const pathname = path.join(clientDirname, req.originalUrl);
    if (fs.existsSync(pathname)) {
      res.sendFile(pathname);
      return;
    }
  }

  next();
}
