import { ClientError } from "../../error/clientError.js";
import { MinutesTimeCache } from "./minuteTimeCache.js";

class Code {
  constructor(public code: string, public tries: number) {}
}

export class TempCodeService {
  private cache = new MinutesTimeCache<Code>();

  constructor(private MAX_TRIES: number = 3) {}

  generateCode(): Code {
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9)
    ).join("");

    return new Code(code, this.MAX_TRIES);
  }

  set(key: string, code: Code) {
    this.cache.set(key, code);
  }

  validate(code: string, key: string) {
    const node = this.cache.get(key);
    if (!node || node.tries >= this.MAX_TRIES)
      return new ClientError("auth", "The code has expired or does not exist.");

    if (code === node.code) {
      this.cache.remove(key);
      return;
    } else {
      node.tries++;
      return new ClientError("auth", "Invalid code, please try again.");
    }
  }
}
