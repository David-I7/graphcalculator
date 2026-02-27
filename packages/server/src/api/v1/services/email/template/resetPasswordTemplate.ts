import { serverOrigin } from "../../../constants.js";
import { BaseTemplate } from "./baseTemplate.js";

export class ResetPasswordTemplate extends BaseTemplate {
  constructor(private code: string) {
    super();
  }

  createTitle(): string {
    return "Reset your Graph Calculator password";
  }

  createContent(): string {
    return `
    <p style="margin: 0;padding-top:1.5rem;padding-bottom: 2.5rem;" >We just received a request to reset your Graph Calculator account password. If you didn't request this, please ignore this email.</p>
          <a 
          href="${serverOrigin}/api/user/account/reset/password?resetToken=${this.code}"
          style="font-size:0.875rem;color: #f0f0f0;text-decoration:none;background-color: #3d5cc2;border-radius: 0.5rem;font-weight: 500;text-align: center;padding: 0.5rem 2rem;">Click to reset your password</a>`;
  }
}
