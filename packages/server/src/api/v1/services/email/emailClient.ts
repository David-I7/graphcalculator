import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";

abstract class EmailClient {
  abstract send(message: string): Promise<boolean>;

  encodeMessage(rawMessage: string): string {
    return Buffer.from(rawMessage).toString("base64");
  }
}

export class GoogleEmailClient extends EmailClient {
  private client: OAuth2Client;

  constructor(client: OAuth2Client) {
    super();
    this.client = client;
  }

  async send(message: string) {
    console.log(message);

    const gm = gmail({ version: "v1", auth: this.client });
    return await gm.users.messages
      .send({
        userId: "me",
        requestBody: {
          raw: this.encodeMessage(message),
        },
      })
      .then((res) => {
        console.log(res);
        return true;
      });
  }
}
