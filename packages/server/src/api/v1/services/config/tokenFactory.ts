import path from "node:path";
import { Tokens } from "../oAuth/types.js";
import fs from "node:fs";
import { serverDirname } from "../../constants.js";

type Token = Record<string, Omit<Tokens, "id_token" | "provider">>;

export class TokenFactory {
  private static tokens: Token;
  private static fd: number;

  constructor() {
    if (!TokenFactory.fd) {
      TokenFactory.fd = fs.openSync(
        path.join(serverDirname, "/config/tokens.json"),
        "r+"
      );
      TokenFactory.tokens = JSON.parse(
        fs.readFileSync(TokenFactory.fd).toString() || "{}"
      );
    }
  }

  set(key: string, value: Token[string]) {
    TokenFactory.tokens[key] = value;
    fs.ftruncate(TokenFactory.fd, 0, (err) => {
      if (err) throw err;
      fs.write(
        TokenFactory.fd,
        JSON.stringify(TokenFactory.tokens),
        0,
        "utf8",
        (err, written, str) => {
          if (err) throw err;
          console.log(written, str);
        }
      );
    });
  }

  get(key: string): Token[string] | undefined {
    return TokenFactory.tokens[key];
  }
}
