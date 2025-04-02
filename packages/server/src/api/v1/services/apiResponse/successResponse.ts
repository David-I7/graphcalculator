import { SuccessResponse } from "./types.js";

export class ApiSuccessResponse {
  createResponse<T>(data: T): SuccessResponse<T> {
    return {
      data,
    };
  }
}
