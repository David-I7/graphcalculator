import { OAuth2Client } from "google-auth-library";
import { OpenIDStrategy, Tokens, UserInfo } from "./types.js";
import { CredentialsFactory } from "../config/credentialsFactory.js";
import { Provider } from "@graphcalculator/types";

export class GoogleOpenIDStrategy implements OpenIDStrategy {
  private providerCode: Provider = Provider.google;
  private credentials: CredentialsFactory = new CredentialsFactory();

  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      this.credentials.getCredentials("google", "auth")
    );
  }

  generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      // must add in case session has expired and user has
      // not logged out => token is not revoked but is dead form my apps pov (dead_token)
      prompt: "consent",
      scope: ["profile", "email"],
    });
  }

  async getUserInfo(access_token: string): Promise<UserInfo> {
    return await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json() as UserInfo)
      .catch((err) => err);
  }

  async getTokens(code: string) {
    const { tokens } = await this.client.getToken(code);
    return { ...tokens, provider: this.providerCode } as Partial<Tokens>;
  }

  async verifyIdToken(idToken: string) {
    const token = await this.client.verifyIdToken({ idToken });
    return token.getPayload()!;
  }

  async refreshAccessToken(refresh_token: string) {
    this.client.setCredentials({ refresh_token });

    try {
      const { credentials } = await this.client.refreshAccessToken();
      return {
        expiry_date: credentials.expiry_date!,
        access_token: credentials.access_token!,
      };
    } catch (err) {
      console.log(err);
    } finally {
      this.client.setCredentials({});
    }
  }

  async revokeRefreshToken(refresh_token: string) {
    return this.client
      .revokeToken(refresh_token)
      .then((res) => true)
      .catch((err) => false);
  }
}
