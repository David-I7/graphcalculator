import { Provider } from "@graphcalculator/types";
import { GoogleOpenIDStrategy } from "./googleStrategy.js";
import { OpenIDStrategy } from "./types.js";

export class OpenIDStrategyFactory {
  createStrategy(provider: Provider): OpenIDStrategy {
    if (provider === Provider.google) return new GoogleOpenIDStrategy();

    throw new Error("Strategy not implemented");
  }
}
