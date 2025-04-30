import { NextFunction, Request, Response } from "express";
import { SessionService } from "../services/sessionService.js";
import { deleteCookie } from "../helpers/cookie.js";
import { GoogleEmailService } from "../services/email/emailService.js";
import { DeleteAccountTemplate } from "../services/email/template/delete/deleteAccountTemplate.js";
import { StrongCodeService } from "../services/cache/static/strongCodeService.js";
import { UserSessionData } from "@graphcalculator/types";

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
      const service = new StrongCodeService<UserSessionData["id"]>();
      const code = service.generateCode(req.session.user!.id);
      service.set(code.code, code);
      const template = new DeleteAccountTemplate(code.code);
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
