import path from "node:path";
import { serverDirname } from "../../constants.js";
import { Provider } from "../oAuth/types.js";
import fs from "node:fs";

type Credentials = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type CredentialsProvider = keyof Omit<Provider, "graphCalculator">;
type RedirectUri = "email" | "auth";

export class CredentialsFactory {
  private static credentials: Record<string, any> = {};

  constructor() {
    const cred = fs.readFileSync(
      path.join(serverDirname, "/config/credentials.json")
    );
    CredentialsFactory.credentials = JSON.parse(
      // @ts-ignore
      cred
    );
  }

  getCredentials(
    provider: CredentialsProvider,
    endpoint: RedirectUri
  ): Credentials {
    const redirectUri = CredentialsFactory.credentials[provider]["redirect"][
      endpoint
    ] as string;
    return {
      redirectUri,
      clientId: CredentialsFactory.credentials[provider]["secrets"]
        .clientId as string,
      clientSecret: CredentialsFactory.credentials[provider]["secrets"]
        .clientSecret as string,
    };
  }

  getEmail(): string {
    return CredentialsFactory.credentials["email"];
  }
}
