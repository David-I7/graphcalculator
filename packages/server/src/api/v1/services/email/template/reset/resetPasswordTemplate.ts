export class ResetPasswordTemplate {
  constructor(private code: string) {}

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
      <p>We just received a request to reset your Graph Calculator password. If you didn't request this, please ignore this email.</p>
      <a href="${process.env.SERVER_ORIGIN}/api/user/account/reset?resetToken=${this.code}">Click to reset your Graph Calculator password</a>
    </body>
    </html>
  `;
  }
}
