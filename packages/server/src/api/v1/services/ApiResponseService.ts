import { ManagedError, ManagedErrorFactory } from "./ErrorFactoryService.js";

export type ErrorResponse = {
  error: {
    code: number;
    type: string;
    message: string;
  };
};

export type SuccessResponse<T extends unknown> = {
  data: T;
};

export class ApiResponseService {
  static createErrorResponse(props: { err: ManagedError }): ErrorResponse;
  static createErrorResponse(props: {
    type: ManagedError["type"];
    message: string;
  }): ErrorResponse;

  static createErrorResponse({
    err,
    type,
    message,
  }: {
    err: ManagedError;
    type: ManagedError["type"];
    message: string;
  }): ErrorResponse {
    const errInstance = err
      ? err
      : ManagedErrorFactory.makeError(type, message);

    return {
      error: {
        message: errInstance.message,
        code: errInstance.code,
        type: errInstance.type,
      },
    };
  }

  static createSuccessResponse<T extends unknown>(data: T): SuccessResponse<T> {
    return {
      data,
    };
  }
}
