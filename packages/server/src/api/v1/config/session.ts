import { SessionOptions } from "express-session";
import { UserSessionData } from "@graphcalculator/types";
import DB from "../db/index.js";
import session from "express-session";
import pgStore from "connect-pg-simple";
import { cookieOptions } from "./cookies.js";
import { Tokens } from "../services/oAuth/types.js";

declare module "express-session" {
  interface SessionData {
    user: UserSessionData;
    tokens: Omit<Tokens, "id_token" | "scope">;
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
  cookie: cookieOptions,
};

export default sessionOptions;
