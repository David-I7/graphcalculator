import { GoogleOAuth2Strategy } from "./googleStrategy.js";

export class OAuth2StrategyFactory {
  createStrategy(type: string) {
    switch (type) {
      case "Google":
        return new GoogleOAuth2Strategy();
      default:
        return null;
    }
  }
}
