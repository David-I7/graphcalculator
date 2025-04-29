export abstract class VerifyCodeTemplate {
  createTemplate() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email address</title>
    </head>
    <body>
      <header>Graph Calculator</header>
      <h1>Verification code</h1>
      <b>${this.createCode()}</b>
    </body>
    </html>
  `;
  }

  abstract createCode(): string;
}
