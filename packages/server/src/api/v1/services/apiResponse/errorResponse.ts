import { CustomError } from "../error/types.js";
import { ErrorResponse } from "./types.js";

export class ApiErrorResponse {
  createResponse(err: CustomError): ErrorResponse {
    return {
      error: {
        message: err.message,
        code: err.code,
        type: err.type,
      },
    };
  }
}
