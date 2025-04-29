import { DeleteCodeTemplate } from "./deleteCodeTemplate.js";

export class DeleteAccountTemplate extends DeleteCodeTemplate {
  constructor(private code: string) {
    super();
  }

  createCode() {
    return this.code;
  }
}
