import { CustomError } from "./types.js";

const ERROR_TYPES = {
  db: 0,
};

export function isServerError(err: Error): err is ServerError {
  return err.name === "ServerError";
}

export class ServerError extends Error implements CustomError {
  readonly type: keyof typeof ERROR_TYPES;
  readonly code: number;
  readonly name = "ServerError";
  constructor(type: keyof typeof ERROR_TYPES, message: string, stack?: string) {
    super(message);
    this.stack = stack;
    this.type = type;
    this.code = ERROR_TYPES[type];
  }
}
