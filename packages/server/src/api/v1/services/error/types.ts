export interface CustomError extends Error {
  type: string;
  code: number;
  name: string;
}

export function isCustomError(err: Error): err is CustomError {
  return "code" in err && "type" in err && "name" in err;
}
