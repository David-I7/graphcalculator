import { ClientError } from "../../error/clientError.js";
import { CodeTimeCache } from "./codeTimeCache.js";

class Code {
  constructor(public code: string, public tries: number) {}
}

export class TempCodeService {
  private cache = new CodeTimeCache<Code>();

  constructor(private MAX_TRIES: number = 5) {}

  generateCode(): Code {
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9)
    ).join("");

    return new Code(code, 0);
  }

  set(key: string, code: Code) {
    this.cache.set(key, code);
  }

  validate(code: string, key: string) {
    const node = this.cache.get(key);
    if (!node || node.tries >= this.MAX_TRIES)
      return new ClientError(
        "auth",
        "The code has expired or does not exist.",
        403
      );

    if (code === node.code) {
      this.cache.remove(key);
      return;
    } else {
      node.tries++;
      return new ClientError("auth", "Invalid code, please try again.", 401);
    }
  }
}
