import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Zlib } from "zlib";
import fs from "node:fs";

const root = Router();

root.get("/", (req, res) => {
  console.log("hello");
  res.sendFile(
    path.join(
      fileURLToPath(import.meta.url),
      "../../../../../../client/dist/index.html"
    )
  );
});

export default root;
