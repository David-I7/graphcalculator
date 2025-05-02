import { Provider, PROVIDERS, UserSessionData } from "@graphcalculator/types";

export type RegisterUserData = Pick<
  UserSessionData,
  "first_name" | "last_name" | "email"
> & { password: string };

export type VerifyEmailResponse = {
  data: { isRegistered: boolean; provider?: Provider };
};

export type ApiErrorResponse = {
  error: {
    code: number;
    message: string;
    type: string;
    statusCode: number;
  };
};

export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  if (!obj || typeof obj !== "object") return false;
  return "error" in obj && typeof obj["error"] === "object";
}
