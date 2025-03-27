import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Zlib } from "zlib";
import fs from "node:fs";
import { clientDirname } from "../constants.js";

const root = Router();

root.get("/", (req, res) => {
  res.sendFile(path.join(clientDirname, "index.html"));
});

export default root;
