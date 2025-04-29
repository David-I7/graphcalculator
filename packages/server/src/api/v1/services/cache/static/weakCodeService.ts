import { StaticTimeCache } from "./staticTimeCache.js";
import { Code, CodeService } from "./codeService.js";

export class CodeTimeCache<T> extends StaticTimeCache<T> {
  private static instance: StaticTimeCache<any>;

  constructor() {
    if (CodeTimeCache.instance) return CodeTimeCache.instance;
    super();
    CodeTimeCache.instance = this;
  }
}

export class WeakCodeService<T> extends CodeService<T> {
  constructor() {
    super(new CodeTimeCache(), 5);
  }

  generateCode(data: T): Code<T> {
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9)
    ).join("");

    return new Code(code, 0, data);
  }
}
