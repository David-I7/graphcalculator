export interface OAuth2Strategy {
  getUrl(): string;
  getTokens<T>(code: string): Promise<T>;
  verifyIdToken<T>(idToken: string): Promise<T>;
}

type PROVIDER = "graphCalculator" | "google" | "apple";
export type Provider = Record<PROVIDER, number>;

export type Tokens = {
  access_token: string;
  refresh_token: string;
  provider: number;
};
