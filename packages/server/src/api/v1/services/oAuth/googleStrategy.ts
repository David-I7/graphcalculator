import { OAuth2Client } from "google-auth-library";
import { OAuth2Strategy, Tokens } from "./types.js";

export class GoogleOAuth2Strategy implements OAuth2Strategy {
  private providerCode: number = 1;

  private client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "http://localhost:8080/api/auth/google/callback",
  });

  generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
    });
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
      return { ...credentials, provider: this.providerCode } as Partial<Tokens>;
    } catch (err) {
      console.log(err);
    } finally {
      this.client.revokeCredentials();
    }
  }

  async revokeRefreshToken(refresh_token: string) {
    return this.client
      .revokeToken(refresh_token)
      .then((res) => true)
      .catch((err) => false);
  }
}
