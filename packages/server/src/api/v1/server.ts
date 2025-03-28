import express from "express";
import path from "node:path";
import { serverDirname } from "./constants.js";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  console.log(req.headers.cookie);
  next();
});

import cors from "cors";
import { corsOptions } from "./config/cors.js";
app.use(cors(corsOptions));
import cookieParser from "cookie-parser";
app.use(cookieParser());

import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
app.use("/assets", serveStaticGZIP);

import root from "./controller/rootController.js";
app.get("/", root);

import graphs from "./route/graphs.js";
app.use("/graphs", graphs);

app.all("*", (req, res) => {
  res.sendFile(path.join(serverDirname, "/view/notFound.html"));
});

import { errorController } from "./controller/errorController.js";
app.use(errorController);

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.port || 8080}`);
});
