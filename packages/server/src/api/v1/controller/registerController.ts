import { Request, Response } from "express";
import { UserService } from "../services/UserService.js";
import { ApiResponseService } from "../services/ApiResponseService.js";
import { ERROR_MESSAGES } from "../constants.js";

const handleEmailVerification = async (req: Request, res: Response) => {
  const email = req.body.email;
  console.log(req.body);
  if (!email) {
    res.status(400).json(
      ApiResponseService.createErrorResponse({
        type: "register",
        message: ERROR_MESSAGES.register.invalidEmail,
      })
    );
    return;
  }

  const exists = await UserService.existsEmail(email);
  console.log(exists);
  res.status(200).json(ApiResponseService.createSuccessResponse({ exists }));
};

export default { handleEmailVerification };
