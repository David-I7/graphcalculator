abstract class IOAuthReponseTemplate {
  createTemplate(): string {
    const origin = this.getOrigin();
    const message = this.createMessage();

    return `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
              <script>
                window.opener.postMessage(${message}, '${origin}')
                 window.close()
              </script>
        </head>
        <body>
        </body>
      </html>
  `;
  }

  abstract createMessage(): string;
  abstract getOrigin(): string;
}

export class OAuthReponseTemplate extends IOAuthReponseTemplate {
  private message: Record<string, any> = {};

  createMessage(): string {
    return JSON.stringify(this.message);
  }

  setMessage(message: Record<string, any>) {
    this.message = message;
  }

  getOrigin(): string {
    return process.env.NODE_ENV === "development"
      ? process.env.DEV_ORIGIN!
      : process.env.SERVER_ORIGIN!;
  }
}
