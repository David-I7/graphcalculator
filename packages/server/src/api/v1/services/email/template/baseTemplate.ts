import { clientOrigin } from "../../../constants.js";

export abstract class BaseTemplate {
  createTemplate(): string {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${this.createTitle()}</title>
      </head>
      <body>
        <main>
          <header style="font-size: 1.25rem;color: #0F0F0F;font-weight: bold;font-family: Arial, Helvetica, sans-serif;padding: 1rem;border-bottom: 1px solid #bababa"><a style="color: #0F0F0F;text-decoration:none;" href="${
            clientOrigin
          }">Graph Calculator</a></header>
          <div style="font-size:1rem;padding: 0 1rem 1rem">
          ${this.createContent()}
          </div>
        </main>
      </body>
    </html>`;
  }

  abstract createTitle(): string;
  abstract createContent(): string;
}
