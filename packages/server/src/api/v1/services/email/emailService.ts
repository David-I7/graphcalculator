import { OAuth2Client } from "google-auth-library";
import { OAuth2Strategy, Tokens } from "../oAuth/types.js";
import { CredentialsFactory } from "../config/credentialsFactory.js";
import { TokenFactory } from "../config/tokenFactory.js";
import { GoogleEmailClient } from "./emailClient.js";
import { MessageBuilder } from "./messageBuilder.js";

abstract class IEmailService {
  protected email: string;

  constructor(email: string) {
    this.email = email;
  }

  getDefaultMessageBuilder(): MessageBuilder {
    return new MessageBuilder().from(this.email);
  }

  abstract sendEmail(message: MessageBuilder): Promise<boolean>;
}

export class GoogleEmailService
  extends IEmailService
  implements OAuth2Strategy
{
  private client: OAuth2Client;
  private tokens = new TokenFactory();

  constructor() {
    const factory = new CredentialsFactory();
    const credentials = factory.getCredentials("google", "email");
    super(factory.getEmail());

    this.client = new OAuth2Client(credentials);
    if (this.tokens.get("email")) {
      this.client.setCredentials(this.tokens.get("email")!);
    }
  }

  generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
    });
  }

  async getTokens(code: string): Promise<Partial<Tokens>> {
    if (this.tokens.get("email") != undefined) {
      return this.tokens.get("email")! satisfies Partial<Tokens>;
    }

    const { tokens } = await this.client.getToken(code);
    this.tokens.set("email", tokens as Omit<Tokens, "id_token" | "provider">);
    return tokens as Partial<Tokens>;
  }

  setTokens() {
    const tokens = this.tokens.get("email");
    if (!tokens) throw new Error("Tokens have not been fetch yet.");
    this.client.setCredentials(tokens);
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
    if (!this.client.credentials.refresh_token) return false;

    this.tokens.delete("email");
    return this.client
      .revokeToken(this.client.credentials.refresh_token)
      .then((res) => true)
      .catch((err) => false);
  }

  isExpiredAccessToken(expiry_date: number): boolean {
    return new Date().getTime() > expiry_date;
  }

  async sendEmail(message: MessageBuilder): Promise<boolean> {
    if (this.isExpiredAccessToken(this.client.credentials.expiry_date!)) {
      await this.refreshAccessToken("");
    }

    const service = new GoogleEmailClient(this.client);
    return service.send(message.build());
  }
}
