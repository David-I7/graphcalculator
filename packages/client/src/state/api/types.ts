export type User = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

export type RegisterUserData = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
};

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
