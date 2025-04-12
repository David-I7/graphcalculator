import { UserSessionData } from "@graphcalculator/types";

export type RegisterUserData = Omit<
  UserSessionData,
  "email_is_verified" | "id"
> & { password: string };

export type VerifyEmailResponse = {
  data: { isRegistered: boolean };
};

export type ApiErrorResponse = {
  error: {
    code: number;
    message: string;
    type: string;
  };
};

export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  if (!obj || typeof obj !== "object") return false;
  return "error" in obj && typeof obj["error"] === "object";
}
