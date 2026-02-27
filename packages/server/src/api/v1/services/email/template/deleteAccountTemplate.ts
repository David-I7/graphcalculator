import { serverOrigin } from "../../../constants.js";
import { BaseTemplate } from "./baseTemplate.js";

export class DeleteAccountTemplate extends BaseTemplate {
  constructor(private code: string) {
    super();
  }

  createTitle(): string {
    return "Delete your Graph Calculator account";
  }

  createContent(): string {
    return `
    <p style="margin: 0;padding-top:1.5rem;padding-bottom: 2.5rem;" >We just received a request to delete your Graph Calculator account. If you didn't request this, please ignore this email.</p>
          <a 
          href="${serverOrigin}/api/user/account?deleteToken=${this.code}"
          style="font-size:0.875rem;color: #0f0f0f;text-decoration:none;background-color: #c74440;border-radius: 0.5rem;font-weight: 500;text-align: center;padding: 0.5rem 2rem;">Click to delete your account</a>`;
  }
}
