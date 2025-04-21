import { GoogleOpenIDStrategy } from "./googleStrategy.js";
import { OpenIDStrategy } from "./types.js";

export class OpenIDStrategyFactory {
  createStrategy(provider: number): OpenIDStrategy {
    if (provider === 1) return new GoogleOpenIDStrategy();

    throw new Error("Strategy not implemented");
  }
}
