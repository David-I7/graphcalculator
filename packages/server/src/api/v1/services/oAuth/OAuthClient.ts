import { randomUUID } from "crypto";
import { IOpenIDClient, OAuth2Strategy, OpenIDStrategy } from "./types.js";
import { OAuthStore } from "./tokenStore.js";

export class OpenIDClient implements IOpenIDClient {
  private strategy!: OpenIDStrategy;

  setStrategy(strategy: OpenIDStrategy): void {
    this.strategy = strategy;
  }

  async revokeRefreshToken(refresh_token: string): Promise<boolean> {
    return this.strategy.revokeRefreshToken(refresh_token);
  }

  async getUserInfo(access_token: string) {
    return await this.strategy.getUserInfo(access_token);
  }

  async saveToStore(code: string): Promise<string> {
    const tokens = await this.strategy.getTokens(code);
    const payload = await this.strategy.verifyIdToken(tokens.id_token!);

    const key = randomUUID();
    OAuthStore.setData(key, {
      tokens: {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        expiry_date: tokens.expiry_date!,
        provider: tokens.provider!,
      },
      payload,
    });

    return key;
  }

  getFromStore(token: string) {
    return OAuthStore.getData(token);
  }

  generateAuthUrl(): string {
    return this.strategy.generateAuthUrl();
  }

  isExpiredAccessToken(expiry_date: number): boolean {
    return new Date().getTime() > expiry_date;
  }

  refreshAccessToken(
    refresh_token: string
  ): ReturnType<OAuth2Strategy["refreshAccessToken"]> {
    return this.strategy.refreshAccessToken(refresh_token);
  }
}
