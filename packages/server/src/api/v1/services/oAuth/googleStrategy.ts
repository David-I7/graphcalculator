import { OAuth2Client } from "google-auth-library";
import { OAuth2Strategy } from "./types.js";

export const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:8080/api/auth/google/callback",
});

export class GoogleOAuth2Strategy implements OAuth2Strategy {
  private client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "http://localhost:8080/api/auth/google/callback",
  });

  getUrl(): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
    });
  }

  async getTokens<T>(code: string) {
    const { tokens } = await this.client.getToken(code);
    return tokens as T;
  }

  async verifyIdToken<T>(idToken: string) {
    return (await this.client.verifyIdToken({ idToken })) as T;
  }
}
