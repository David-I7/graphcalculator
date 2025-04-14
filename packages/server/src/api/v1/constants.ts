import path from "node:path";
import { fileURLToPath } from "node:url";

export const serverDirname = path.dirname(fileURLToPath(import.meta.url));
export const publicDirname = path.join(
  fileURLToPath(import.meta.url),
  "../../../../public"
);
export const clientDirname = path.join(
  fileURLToPath(import.meta.url),
  "../../../../../client/dist"
);

// export const provider = {
//   graphCalculator: 0,
//   google: 1,
// };
