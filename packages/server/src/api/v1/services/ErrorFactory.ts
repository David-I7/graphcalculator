export interface ManagedError extends Error {
  type: keyof typeof ERROR_TYPES;
  code: number;
}

const ERROR_TYPES = {
  cors: 0,
};

const ERROR_MESSAGES: Record<keyof typeof ERROR_TYPES, string> = {
  cors: "Not allowed by CORS.",
};

export class ManagedErrorFactory {
  static makeError(type: ManagedError["type"], stack?: string): ManagedError {
    return new ManagedErrorImpl(type, stack);
  }
}

export class ManagedErrorImpl extends Error implements ManagedError {
  readonly type: ManagedError["type"];
  readonly code: number;
  constructor(type: ManagedError["type"], stack?: string) {
    super(ERROR_MESSAGES[type]);
    Object.setPrototypeOf(this, ManagedErrorImpl.prototype);
    this.stack = stack;
    this.type = type;
    this.code = ERROR_TYPES[type];
  }
}
