import { StaticTimeCache } from "./staticTimeCache.js";

export class MinutesTimeCache<T> extends StaticTimeCache<T> {
  private static instance: StaticTimeCache<any>;

  constructor() {
    if (MinutesTimeCache.instance) return MinutesTimeCache.instance;
    super();
    MinutesTimeCache.instance = this;
  }
}
