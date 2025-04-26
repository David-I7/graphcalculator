import { StaticTimeCache } from "./staticTimeCache.js";

export class CodeTimeCache<T> extends StaticTimeCache<T> {
  private static instance: StaticTimeCache<any>;

  constructor() {
    if (CodeTimeCache.instance) return CodeTimeCache.instance;
    super();
    CodeTimeCache.instance = this;
  }
}
