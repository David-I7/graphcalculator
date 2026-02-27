import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

dotenv.config({
  path: path.join(serverDirname, "..", "..", "..", ".env"),
});
