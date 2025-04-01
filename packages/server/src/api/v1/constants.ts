import path from "node:path";
import { fileURLToPath } from "node:url";

export const serverDirname = path.dirname(fileURLToPath(import.meta.url));
export const clientDirname = path.join(
  fileURLToPath(import.meta.url),
  "../../../../../client/dist"
);

export const ERROR_TYPES = {
  cors: 0,
  auth: 1,
  register: 2,
};

export const ERROR_MESSAGES = {
  cors: { invalidOrigin: "Not allowed by CORS." },
  register: {
    duplicateEmail: "Email already exists.",
    invalidEmail: "Email is invalid.",
  },
  auth: {},
};
