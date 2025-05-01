import { NextFunction, Request, Response } from "express";
import { SessionService } from "../services/sessionService.js";
import { deleteCookie } from "../helpers/cookie.js";
import { GoogleEmailService } from "../services/email/emailService.js";
import { DeleteAccountTemplate } from "../services/email/template/deleteAccountTemplate.js";
import { JWTService } from "../services/jwt/jwtService.js";

const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { deleteUser } = req.query;
  const sessionService = new SessionService();

  if (typeof deleteUser === "string" && deleteUser === "1") {
    const emailService = new GoogleEmailService();
    try {
      const message = emailService.getDefaultMessageBuilder();
      const token = await new JWTService().sign({
        userId: req.session.user!.id,
      });
      const template = new DeleteAccountTemplate(token);
      message
        .to(req.session.user!.email)
        .subject("Delete you Graph Calculator account")
        .html(template.createTemplate());

      await emailService.sendEmail(message);
    } catch (err) {
      console.log(err);
    }
  }

  let isDeleted: boolean = false;
  if (req.session.tokens || (typeof deleteUser === "boolean" && deleteUser)) {
    isDeleted = await sessionService.deleteSessionRecursive(
      req.session.user!.id,
      () => deleteCookie(res)
    );
  } else {
    isDeleted = await sessionService.deleteSession(req.session, () =>
      deleteCookie(res)
    );
  }

  if (isDeleted) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
};

export default { handleLogout };
