import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
import router from "./route/index.js";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  console.log(req.headers.cookie);
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/assets", serveStaticGZIP);
app.use(router);

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.PORT || 8080}`);
});
