import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
}, serveStaticGZIP);

app.use(
  express.static(
    path.join(fileURLToPath(import.meta.url), "../../../../../client/dist"),
    {
      setHeaders(res, path) {
        if (path.endsWith(".gz")) {
          res.setHeader("cache-control", "public, max-age=604800, immutable");
          res.setHeader("content-encoding", "gzip");
        }
      },
    }
  )
);

import root from "./route/root.js";
import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
app.get("/", root);

app.all("*", (req, res) => {
  res.sendFile(
    path.join(fileURLToPath(import.meta.url), "../view/notFound.html")
  );
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.port || 8080}`);
});
