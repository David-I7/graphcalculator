import { OAuth2Client } from "google-auth-library";
import { OAuth2Strategy, Tokens } from "../oAuth/types.js";
import { CredentialsFactory } from "../config/credentialsFactory.js";
import { TokenFactory } from "../config/tokenFactory.js";
import { GoogleEmailClient } from "./emailClient.js";
import { MessageBuilder } from "./messageBuilder.js";

export class GoogleEmailService implements OAuth2Strategy {
  private client: OAuth2Client;
  private cache = new TokenFactory();
  private email: string;

  constructor() {
    const factory = new CredentialsFactory();
    const credentials = factory.getCredentials("google", "email");
    this.email = factory.getEmail();
    this.client = new OAuth2Client(credentials);
    if (this.cache.get("email")) {
      this.client.setCredentials(this.cache.get("email")!);
    }
  }

  generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
    });
  }

  async getTokens(code: string): Promise<Partial<Tokens>> {
    if (this.cache.get("email") != undefined) {
      return this.cache.get("email")! satisfies Partial<Tokens>;
    }

    const { tokens } = await this.client.getToken(code);
    new TokenFactory().set(
      "email",
      tokens as Omit<Tokens, "id_token" | "provider">
    );
    return tokens as Partial<Tokens>;
  }

  async refreshAccessToken(refresh_token?: string) {
    try {
      const { credentials } = await this.client.refreshAccessToken();
      return credentials.access_token!;
    } catch (err) {
      console.log(err);
    }
  }

  async revokeRefreshToken(refresh_token?: string) {
    return this.client
      .revokeToken(this.client.credentials.refresh_token!)
      .then((res) => true)
      .catch((err) => false);
  }

  isExpiredAccessToken(expiry_date: number): boolean {
    return new Date().getTime() > expiry_date;
  }

  getDefaultMessageBuilder(): MessageBuilder {
    return new MessageBuilder().from(this.email);
  }

  async sendEmail(message: MessageBuilder): Promise<Boolean> {
    if (this.isExpiredAccessToken(this.client.credentials.expiry_date!)) {
      await this.refreshAccessToken("");
    }

    const service = new GoogleEmailClient(this.client);
    return service.send(message.build());
  }
}
