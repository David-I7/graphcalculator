import express from "express";
import path from "node:path";
import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
import { serverDirname } from "./constants.js";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/assets", serveStaticGZIP);

import root from "./controller/rootController.js";
app.get("/", root);
import graphs from "./route/graphs.js";
app.use("/graphs", graphs);

app.all("*", (req, res) => {
  res.sendFile(path.join(serverDirname, "/view/notFound.html"));
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.port || 8080}`);
});
