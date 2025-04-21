export class MessageBuilder {
  private message: {
    from?: string;
    to?: string;
    text?: string;
    subject?: string;
    html?: string;
  };

  constructor() {
    this.message = {};
  }

  from(from: string) {
    this.message["from"] = from;
    return this;
  }

  to(to: string) {
    this.message["from"] = to;
    return this;
  }

  subject(subject: string) {
    this.message["subject"] = subject;
    return this;
  }

  text(text: string) {
    this.message["text"] = text;
    return this;
  }

  html(html: string) {
    this.message["html"] = html;
    return this;
  }

  build(): string {
    if (
      !this.message["from"] ||
      !this.message["to"] ||
      !this.message["subject"]
    )
      throw new Error("Must supply from, to and subject in the message");

    let message: string = "";

    message.concat(
      `From: Graph Calculator <${this.message["from"]}>\n`,
      `To: ${this.message["to"]}\n`,
      `Subject: ${this.message["subject"]}\n`
    );

    if (this.message["html"] && this.message["text"]) {
      const boundary = "--u024ihtiboundary2084thw09t";

      message.concat(
        `Content-Type: multipart/alternative; boundary="${boundary.substring(
          2
        )}"\n`,
        boundary,
        "\n",
        `Content-Type: text/plain; charset="UTF-8"\n`,
        `${this.message["text"]}\n`,
        boundary,
        "\n",
        `Content-Type: text/html; charset="UTF-8"\n`,
        `${this.message["html"]}\n`,
        `${boundary}--`
      );
    } else if (this.message["text"]) {
      message.concat(
        `Content-Type: text/plain; charset="UTF-8"\n`,
        `${this.message["text"]}`
      );
    } else {
      message.concat(
        `Content-Type: text/html; charset="UTF-8"\n`,
        `${this.message["html"]}`
      );
    }

    return message;
  }
}
