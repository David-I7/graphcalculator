import path from "node:path";
import { Tokens } from "../oAuth/types.js";
import fs, { existsSync } from "node:fs";
import { serverDirname } from "../../constants.js";

type Token = Record<string, Omit<Tokens, "id_token" | "provider">>;

export class TokenFactory {
  private static tokens: Token;
  private static fd: number;

  constructor() {
    if (!TokenFactory.fd) {
      const filePath = path.join(serverDirname, "/config/tokens.json");

      if (!existsSync(filePath)) {
        fs.closeSync(fs.openSync(filePath, "w"));
      }

      TokenFactory.fd = fs.openSync(filePath, "r+");

      TokenFactory.tokens = JSON.parse(
        fs.readFileSync(TokenFactory.fd).toString() || "{}"
      );
    }
  }

  async set(key: string, value: Token[string]) {
    TokenFactory.tokens[key] = value;
    return this.save();
  }

  private async save(): Promise<boolean> {
    return new Promise((res, rej) =>
      fs.ftruncate(TokenFactory.fd, 0, (err) => {
        if (err) rej(err);
        fs.write(
          TokenFactory.fd,
          JSON.stringify(TokenFactory.tokens),
          0,
          "utf8",
          (err) => {
            if (err) rej(err);
            res(true);
          }
        );
      })
    );
  }

  async delete(key: string): Promise<boolean> {
    if (!(key in TokenFactory.tokens)) return false;
    delete TokenFactory.tokens[key];
    return this.save();
  }

  get(key: string): Token[string] | undefined {
    return TokenFactory.tokens[key];
  }
}
