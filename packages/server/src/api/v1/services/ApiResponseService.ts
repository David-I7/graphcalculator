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
  static createErrorResponse(err: ManagedError): ErrorResponse;

  static createErrorResponse(err: ManagedError): ErrorResponse {
    return {
      error: {
        message: err.message,
        code: err.code,
        type: err.type,
      },
    };
  }

  static createSuccessResponse<T extends unknown>(data: T): SuccessResponse<T> {
    return {
      data,
    };
  }
}
