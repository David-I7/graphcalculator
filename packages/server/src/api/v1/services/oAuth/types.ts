import { TokenPayload } from "google-auth-library";
import { OAuthStore } from "./tokenStore.js";

export interface OAuth2Strategy {
  generateAuthUrl(): string;
  revokeRefreshToken(refresh_token: string): Promise<boolean>;
  getTokens(code: string): Promise<Partial<Tokens>>;
  verifyIdToken(idToken: string): Promise<TokenPayload>;
}

export interface IOAuth2Client {
  setStrategy(strategy: OAuth2Strategy): void;
  generateAuthUrl(): string;
  revokeRefreshToken(refresh_token: string): Promise<boolean>;
  saveToStore(code: string): Promise<string>;
  getFromStore(token: string): ReturnType<typeof OAuthStore.getData>;
}

type PROVIDER = "graphCalculator" | "google";
export type Provider = Record<PROVIDER, number>;

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expiry_date: string;
  scope: string;
  id_token: string;
  provider: number;
};
