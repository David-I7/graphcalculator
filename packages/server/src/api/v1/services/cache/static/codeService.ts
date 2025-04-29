import { ClientError } from "../../error/clientError.js";
import { StaticTimeCache } from "./staticTimeCache.js";

export class Code<T> {
  constructor(public code: string, public tries: number, public data: T) {}
}

export abstract class CodeService<T extends any = undefined> {
  constructor(
    private cache: StaticTimeCache<Code<T>>,
    private MAX_TRIES: number = 5
  ) {}

  set(key: string, code: Code<T>) {
    this.cache.set(key, code);
  }

  get(key: string): Code<T> | undefined {
    return this.cache.get(key);
  }

  validate(code: string, key: string) {
    const node = this.cache.get(key);
    if (!node || (this.MAX_TRIES > 0 && node.tries >= this.MAX_TRIES))
      return new ClientError(
        "auth",
        "The code has expired or does not exist.",
        403
      );

    if (code === node.code) {
      this.cache.remove(key);
      return node;
    } else {
      if (this.MAX_TRIES > 0) {
        node.tries++;
        return new ClientError(
          "auth",
          `Invalid code, remaining attempts: ${this.MAX_TRIES - node.tries}`,
          401
        );
      } else {
        return new ClientError("auth", `Invalid code, please try again.`, 401);
      }
    }
  }

  abstract generateCode(data?: T): Code<T>;
}
