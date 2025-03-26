import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function serveStaticGZIP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let extension: string = "";

  let i = req.url.length - 1;
  while (i >= 0 && (req.url[i] !== "." || req.url[i] !== "/")) {
    i--;
  }

  if (i >= 0 && req.url[i] === ".") {
    extension = req.url.substring(i);
  }

  console.log(i, extension);

  if (extension === ".js" || extension === ".css") {
    req.url = req.url.concat(".gz");
    res.setHeader("cache-control", "public, max-age=60000, must-revalidate");
    res.setHeader("content-encoding", "gzip");

    res.setHeader(
      "content-type",
      `text/${extension == ".js" ? "javascript" : "css"}`
    );

    console.log(
      path.join(
        fileURLToPath(import.meta.url),
        "../../../../../client/dist",
        req.url
      )
    );

    // res.sendFile(path.join(fileURLToPath(import.meta.url),"../../../../../client/dist",req.url))
    // return;
  }

  next();
}
