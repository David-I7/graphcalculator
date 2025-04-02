import { ClientError } from "./clientError.js";
import { CustomError } from "./types.js";

export class SimpleErrorFactory {
  createClientError(
    type: ClientError["type"],
    message: string,
    stack?: string
  ): CustomError {
    return new ClientError(type, message, stack);
  }
}
