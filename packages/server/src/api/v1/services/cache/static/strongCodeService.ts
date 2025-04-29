import { randomBytes } from "node:crypto";
import { Code, CodeService } from "./codeService.js";
import { StaticTimeCache } from "./staticTimeCache.js";

export class CodeTimeCache<T> extends StaticTimeCache<T> {
  private static instance: StaticTimeCache<any>;

  constructor() {
    if (CodeTimeCache.instance) return CodeTimeCache.instance;
    super();
    CodeTimeCache.instance = this;
  }
}

export class StrongCodeService<T> extends CodeService<T> {
  constructor() {
    super(new CodeTimeCache(), 5);
  }

  generateCode(data: T): Code<T> {
    const code = randomBytes(16).toString("base64");

    return new Code(code, 0, data);
  }
}
