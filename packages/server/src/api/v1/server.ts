import "./config/dotenvConfig.js";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
import router from "./route/index.js";
import sesssion from "express-session";
import sessionOptions from "./config/session.js";
import "./services/jobs/index.js";
import { ONE_YEAR, publicDirname } from "./constants.js";
import "./services/cache/static/codeTimeCache.js";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/assets", serveStaticGZIP);
app.use("/public", express.static(publicDirname, { maxAge: ONE_YEAR }));
app.use(sesssion(sessionOptions));
app.use(express.json());

app.use(router);

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.PORT || 8080}`);
});
