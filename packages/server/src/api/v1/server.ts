import "./config/dotenvConfig.js";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import cookieParser from "cookie-parser";
import serveStaticGZIP from "./middleware/serveStaticGZIP.js";
import router from "./route/index.js";
import sesssion from "express-session";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/assets", serveStaticGZIP);
app.use(
  sesssion({
    resave: false,
    saveUninitialized: false,
    name: "sid",
    secret: process.env.SESSION_SECRET!,
    cookie: {
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60000 * 60 * 24 * 365,
    },
  })
);
app.use(express.json());

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      name: string;
    };
  }
}

app.use(router);

app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${process.env.PORT || 8080}`);
});
