import { VerifyCodeTemplate } from "./verifyCodeTemplate.ts.js";

export class VerifyEmailTemplate extends VerifyCodeTemplate {
  constructor(private code: string) {
    super();
  }

  createCode(): string {
    return this.code;
  }
}
