import { GoogleOAuth2Strategy } from "./googleStrategy.js";
import { OAuth2Strategy, Provider } from "./types.js";

export class OAuth2StrategyFactory {
  createStrategy(provider: number): OAuth2Strategy {
    if (provider === 1) return new GoogleOAuth2Strategy();

    throw new Error("Strategy not implemented");
  }
}
