import { TokenPayload } from "google-auth-library";
import { Tokens } from "./types.js";

export class OAuthStore {
  private static cacheLifeTimeMs = 1000 * 60;
  private static cache: {
    [token: string]: {
      tokens: Omit<Tokens, "id_token" | "scope">;
      payload: TokenPayload;
      expires: number;
    };
  } = {};

  static getData(token: string) {
    OAuthStore.pruneStaleTokens();
    if (token in OAuthStore.cache) {
      const credentials = OAuthStore.cache[token];
      delete OAuthStore.cache[token];
      return credentials;
    }
  }

  static hasData(token: string) {
    OAuthStore.pruneStaleTokens();
    return token in OAuthStore.cache;
  }

  static setData(
    token: string,
    data: {
      tokens: Omit<Tokens, "id_token" | "scope">;
      payload: TokenPayload;
    }
  ) {
    OAuthStore.pruneStaleTokens();

    if (token in OAuthStore.cache) {
      return;
    }

    OAuthStore.cache[token] = {
      ...data,
      expires: OAuthStore.createExpiration(),
    };
  }

  private static createExpiration() {
    return new Date().getTime() + OAuthStore.cacheLifeTimeMs;
  }

  private static isExpired(timestamp: number) {
    return timestamp - new Date().getTime() <= 0;
  }

  private static pruneStaleTokens() {
    Object.entries(OAuthStore.cache).forEach((entry) => {
      if (OAuthStore.isExpired(entry[1].expires)) {
        delete OAuthStore.cache[entry[0]];
      }
    });
  }
}
