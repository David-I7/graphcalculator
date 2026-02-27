import path from "node:path";
import { fileURLToPath } from "node:url";

export const serverDirname = path.dirname(fileURLToPath(import.meta.url));
export const publicDirname = path.join(serverDirname, "../../../public");
export const clientDirname = path.join(
  serverDirname,
  "../../../../client/dist",
);
export const ONE_YEAR = 1000 * 60 * 60 * 24 * 7 * 4 * 12;

export const clientOrigin =
  process.env["NODE_ENV"] === "production"
    ? process.env.SERVER_ORIGIN!
    : process.env["NODE_ENV"] === "preview"
      ? process.env.CLIENT_PREVIEW_ORIGIN!
      : process.env.CLIENT_DEV_ORIGIN!;

export const serverOrigin =
  process.env["NODE_ENV"] === "production"
    ? process.env.SERVER_ORIGIN!
    : process.env.SERVER_DEV_ORIGIN!;
