import { ClientError } from "./error/clientError.js";
import { ServerError } from "./error/serverError.js";
import { CustomError } from "./error/types.js";
import { SessionObject, SessionService } from "./sessionService.js";

export class TmpCodeService {
  private EXPIRES: number = 1000 * 60 * 5;
  private MAX_RETRIES: number = 3;

  generate(): string {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 9)).join(
      ""
    );
  }

  save(code: string, session: SessionObject) {
    const sessionService = new SessionService();
    sessionService.updateSession(session, {
      tmp: {
        ...session.tmp,
        [session.user!.id]: {
          ...session.tmp?.[session.user!.id],
          sessionCode: code,
          sessionCodeExpiresMS: (
            new Date().getTime() + this.EXPIRES
          ).toString(),
          sessionCodeTries: "0",
        },
      },
    });
  }

  private isExpired(expirationMS: string): boolean {
    return new Date().getTime() > new Date(Number(expirationMS)).getTime();
  }

  private clearCode(session: SessionObject) {
    const userId = session.user!.id;
    const curTmp = session.tmp![userId];
    const sessionService = new SessionService();

    if (Object.keys(curTmp).length > 2) {
      delete curTmp.sessionCode;
      delete curTmp.sessionCodeExpiresMS;
      delete curTmp.sessionCodeTries;
      sessionService.updateSession(session, {
        tmp: {
          ...session.tmp,
          [userId]: { ...session.tmp![userId], ...curTmp },
        },
      });
    } else {
      const { [userId]: tmpData, ...rest } = session.tmp!;

      sessionService.updateSession(session, {
        tmp: rest,
      });
    }
  }

  private incrementTries(session: SessionObject) {
    const userId = session.user!.id;
    const curTmp = session.tmp![userId];
    const sessionService = new SessionService();

    curTmp.sessionCodeTries = (Number(curTmp.sessionCodeTries) + 1).toString();

    sessionService.updateSession(session, {
      tmp: {
        ...session.tmp,
        [userId]: { ...session.tmp![userId], ...curTmp },
      },
    });
  }

  validate(code: string, session: SessionObject): CustomError | undefined {
    const userId = session.user!.id;
    const curTmp = session.tmp?.[userId];
    if (
      !curTmp ||
      !curTmp.sessionCode ||
      !curTmp.sessionCodeExpiresMS ||
      !curTmp.sessionCodeTries
    )
      return new ClientError("auth", "No code has been generated.");

    if (
      this.isExpired(curTmp.sessionCodeExpiresMS) ||
      Number(curTmp.sessionCodeTries) > this.MAX_RETRIES
    ) {
      this.clearCode(session);
      return new ClientError("auth", "The code has expired.");
    }

    const isValid = curTmp.sessionCode === code;
    if (isValid) {
      this.clearCode(session);
      return;
    } else {
      this.incrementTries(session);
      return new ClientError("auth", "Invalid code, please try again.");
    }
  }
}
