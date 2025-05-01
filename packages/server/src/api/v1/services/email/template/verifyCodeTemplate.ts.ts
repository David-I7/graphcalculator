import { BaseTemplate } from "./baseTemplate.js";

export class VerifyCodeTemplate extends BaseTemplate {
  constructor(private code: string) {
    super();
  }

  createTitle(): string {
    return "Verify your email address";
  }

  createContent(): string {
    return `
    <h1 style="padding: 1.5rem 0rem;font-size:2rem;text-align:center;font-weight:500">Verification code</h1>
      <p style="font-size: 3rem;font-weight:600;letter-spacing: 1.5rem;text-align: center;letter-spacing: 1rem;">${this.code}</p>
`;
  }
}
