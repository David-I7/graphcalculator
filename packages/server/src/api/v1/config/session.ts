import { SessionOptions } from "express-session";
import { UserSessionData } from "../db/entity/user.js";
import DB from "../db/index.js";
import session from "express-session";
import pgStore from "connect-pg-simple";

declare module "express-session" {
  interface SessionData {
    user: UserSessionData;
  }
}

const sessionOptions: SessionOptions = {
  store: new (pgStore(session))({
    pool: DB.pool,
    createTableIfMissing: true,
  }),
  resave: false,
  saveUninitialized: false,
  name: "sid",
  secret: process.env.SESSION_SECRET!,
  cookie: {
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60000 * 5,
  },
};

export default sessionOptions;
