import { CorsOptions } from "cors";
import { SimpleErrorFactory } from "../services/error/simpleErrorFactory.js";

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
      callback(
        new SimpleErrorFactory().createClientError(
          "cors",
          "Not allowed by CORS.",
          403
        ),
        false
      );
    }
  },
  credentials: true,
};
