export abstract class DeleteCodeTemplate {
  createTemplate() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <titleDelete account</title>
    </head>
    <body>
      <header>Graph Calculator</header>
      <p>We just received a request to delete your Desmos account. If you didn't request this, please ignore this email.</p>
      <a href="${
        process.env.SERVER_ORIGIN
      }/api/user?deleteToken=${this.createCode()}">Click to delete your Graph Calculator account</a>
      
    </body>
    </html>
  `;
  }

  abstract createCode(): string;
}
