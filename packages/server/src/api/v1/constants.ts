import path from "node:path";
import { fileURLToPath } from "node:url";

export const serverDirname = path.dirname(fileURLToPath(import.meta.url));
export const clientDirname = path.dirname(
  path.join(fileURLToPath(import.meta.url), "../../../../../client/dist")
);
