import { CorsOptions } from "cors";
import { ManagedErrorFactory } from "../services/ErrorFactory.js";

const allowedOrigins: Set<string> = new Set<string>([
  "http://localhost",
  "http://127.0.0.1",
]);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const portIdx = origin.lastIndexOf(":");
    const strippedPort = portIdx !== -1 ? origin.substring(0, portIdx) : origin;
    if (allowedOrigins.has(strippedPort)) callback(null, true);
    else {
      callback(ManagedErrorFactory.makeError("cors"), false);
    }
  },
  credentials: true,
};
