import { ClientError } from "./clientError.js";
import { ServerError } from "./serverError.js";
import { CustomError } from "./types.js";

export class SimpleErrorFactory {
  createClientError(
    type: ClientError["type"],
    message: string,
    statusCode: number,
    stack?: string
  ): CustomError {
    return new ClientError(type, message, statusCode, stack);
  }

  createServerError(
    type: ServerError["type"],
    message: string,
    statusCode: number,
    stack?: string
  ): CustomError {
    return new ServerError(type, message, statusCode, stack);
  }
}
