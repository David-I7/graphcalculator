import { ERROR_TYPES } from "../constants.js";

export class ManagedErrorFactory {
  static makeError(
    type: ManagedError["type"],
    message: string,
    stack?: string
  ): ManagedError {
    return new ManagedError(type, message, stack);
  }
}

export class ManagedError extends Error {
  readonly type: keyof typeof ERROR_TYPES;
  readonly code: number;
  constructor(type: keyof typeof ERROR_TYPES, message: string, stack?: string) {
    super(message);
    Object.setPrototypeOf(this, ManagedError.prototype);
    this.stack = stack;
    this.type = type;
    this.code = ERROR_TYPES[type];
  }
}
