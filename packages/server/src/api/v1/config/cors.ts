import { CorsOptions } from "cors";
import { ManagedErrorFactory } from "../services/ErrorFactory.js";

const allowedOrigins: Set<string> = new Set<string>([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else {
      callback(ManagedErrorFactory.makeError("cors"), false);
    }
  },
  credentials: true,
};
