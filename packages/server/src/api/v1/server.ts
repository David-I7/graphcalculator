import "./config/dotenvConfig.js";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import router from "./route/index.js";
import sesssion from "express-session";
import sessionOptions from "./config/session.js";
import "./services/jobs/index.js";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(sesssion(sessionOptions));
app.use(express.json());

app.use(router);

app.listen(Number(process.env.PORT) || 8080, "192.168.1.131", () => {
  console.log(`App listening on port ${process.env.PORT || 8080}`);
});
