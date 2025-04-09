import { TokenPayload } from "google-auth-library";
import { Tokens } from "./types.js";

export class OAuthStore {
  private static cache: {
    [token: string]: { tokens: Tokens; payload: TokenPayload };
  } = {};

  static getData(token: string) {
    if (token in OAuthStore.cache) {
      const credentials = OAuthStore.cache[token];
      delete OAuthStore.cache[token];
      return credentials;
    }
  }

  static hasData(token: string) {
    return token in OAuthStore.cache;
  }

  static setData(
    token: string,
    data: { tokens: Tokens; payload: TokenPayload }
  ) {
    if (token in OAuthStore.cache) {
      return;
    }
    OAuthStore.cache[token] = data;
  }
}
