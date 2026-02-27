import "./config/dotenvConfig.js";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import router from "./route/index.js";
import sesssion from "express-session";
import sessionOptions from "./config/session.js";
import "./services/jobs/index.js";
import { publicDirname } from "./constants.js";

const app = express();

app.set("trust proxy", true);

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });
}

app.use(cors(corsOptions));
if (process.env.NODE_ENV === "development")
  app.use("/public", express.static(publicDirname, { maxAge: 1000 * 60 * 5 }));
app.use(cookieParser());
app.use(sesssion(sessionOptions));
app.use(express.json());

app.use(router);

app.listen(8080, "localhost", () => {
  console.log(`App listening on port 8080`);
  console.log(`NODE_ENV=${process.env.NODE_ENV}`);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down...");
  process.exit(0);
});
