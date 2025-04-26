import { CustomError } from "./types.js";

const ERROR_TYPES = {
  cors: 0,
  auth: 1,
  register: 2,
};

export function isClientError(err: Error): err is ClientError {
  return err.name === "ClientError";
}

export class ClientError extends Error implements CustomError {
  readonly type: keyof typeof ERROR_TYPES;
  readonly code: number;
  readonly name = "ClientError";
  readonly statusCode: number;
  constructor(
    type: keyof typeof ERROR_TYPES,
    message: string,
    statusCode: number,
    stack?: string
  ) {
    super(message);
    this.stack = stack;
    this.type = type;
    this.code = ERROR_TYPES[type];
    this.statusCode = statusCode;
  }
}
