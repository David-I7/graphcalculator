import { VerifyCodeTemplate } from "./verifyCodeTemplate.ts.js";

export class VerifyEmaiTemplate extends VerifyCodeTemplate {
  constructor(private code: string) {
    super();
  }

  createCode(): string {
    return this.code;
  }
}
