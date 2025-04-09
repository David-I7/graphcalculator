import path from "node:path";
import { fileURLToPath } from "node:url";
import { Provider } from "./services/oAuth/types.js";

export const serverDirname = path.dirname(fileURLToPath(import.meta.url));
export const clientDirname = path.join(
  fileURLToPath(import.meta.url),
  "../../../../../client/dist"
);
export const provider: Provider = {
  graphCalculator: 0,
  google: 1,
  apple: 2,
};
