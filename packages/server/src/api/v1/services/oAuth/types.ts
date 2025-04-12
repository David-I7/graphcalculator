import { TokenPayload } from "google-auth-library";
import { OAuthStore } from "./tokenStore.js";

export interface OAuth2Strategy {
  generateAuthUrl(): string;
  revokeRefreshToken(refresh_token: string): Promise<boolean>;
  getTokens(code: string): Promise<Partial<Tokens>>;
  verifyIdToken(idToken: string): Promise<TokenPayload>;
  refreshAccessToken(refresh_token: string): Promise<string | undefined>;
  getUserInfo(access_token: string): Promise<UserInfo>;
}

export interface IOAuth2Client {
  setStrategy(strategy: OAuth2Strategy): void;
  generateAuthUrl(): string;
  revokeRefreshToken(refresh_token: string): Promise<boolean>;
  saveToStore(code: string): Promise<string>;
  getFromStore(token: string): ReturnType<typeof OAuthStore.getData>;
  refreshAccessToken(
    refresh_token: string
  ): ReturnType<OAuth2Strategy["refreshAccessToken"]>;
  isExpiredAccessToken(expiry_date: number): boolean;
  getUserInfo(access_token: string): Promise<UserInfo>;
}

type PROVIDER = "graphCalculator" | "google";
export type Provider = Record<PROVIDER, number>;

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  id_token: string;
  provider: number;
};

export type UserInfo = Pick<
  TokenPayload,
  "email" | "family_name" | "email_verified" | "given_name"
>;
