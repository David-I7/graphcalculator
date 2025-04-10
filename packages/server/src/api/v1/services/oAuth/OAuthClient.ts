import { randomUUID } from "crypto";
import { IOAuth2Client, OAuth2Strategy } from "./types.js";
import { OAuthStore } from "./tokenStore.js";

export class OAuth2Client implements IOAuth2Client {
  private strategy!: OAuth2Strategy;

  setStrategy(strategy: OAuth2Strategy): void {
    this.strategy = strategy;
  }

  async revokeRefreshToken(refresh_token: string): Promise<boolean> {
    return this.strategy.revokeRefreshToken(refresh_token);
  }

  async getTokenPayload(id_token: string) {
    return await this.strategy.verifyIdToken(id_token);
  }

  async saveToStore(code: string): Promise<string> {
    const tokens = await this.strategy.getTokens(code);

    const payload = await this.strategy.verifyIdToken(tokens.id_token!);

    const token = randomUUID();
    OAuthStore.setData(token, {
      tokens: {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        expiry_date: tokens.expiry_date!,
        provider: tokens.provider!,
      },
      payload,
    });

    return token;
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
