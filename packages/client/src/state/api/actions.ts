import { baseUrl } from "./config";
import {
  ApiErrorResponse,
  RegisterUserData,
  VerifyEmailResponse,
} from "./types";
import { UserSessionData } from "@graphcalculator/types";

function createFetchError(statusCode: number): ApiErrorResponse {
  return {
    error: {
      statusCode,
      code: -1,
      type: "network error",
      message: `A network error has occurred.`,
    },
  };
}

async function handleApiResponse(res: Response) {
  const contentType = res.headers.get("content-type");
  if (res.ok && contentType?.startsWith("application/json")) {
    return await res.json();
  } else if (res.ok && contentType?.startsWith("text/plain"))
    return await res.text();
  else if (res.ok) return "Success";

  if (contentType?.startsWith("application/json")) {
    return await res.json();
  } else {
    return createFetchError(503);
  }
}

export async function verifyIsRegistered(
  email: string
): Promise<ApiErrorResponse | VerifyEmailResponse> {
  return await fetch(baseUrl + "/register/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  }).then(handleApiResponse);
}

export async function authenticateUser(data: {
  email: string;
  password: string;
}): Promise<{ data: { user: UserSessionData } } | ApiErrorResponse> {
  return await fetch(baseUrl + "/auth", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleApiResponse);
}

export async function registerUser(
  user: RegisterUserData
): Promise<{ data: { user: UserSessionData } } | ApiErrorResponse>;
export async function registerUser(
  token: string
): Promise<{ data: { user: UserSessionData } } | ApiErrorResponse>;

export async function registerUser(
  arg: RegisterUserData | string
): Promise<{ data: { user: UserSessionData } } | ApiErrorResponse> {
  return await fetch(baseUrl + "/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(typeof arg === "string" ? { token: arg } : arg),
  }).then(handleApiResponse);
}

export async function logoutUser(): Promise<string | ApiErrorResponse> {
  return await fetch(baseUrl + "/logout", { credentials: "include" }).then(
    handleApiResponse
  );
}

export async function updateUserCredentials(credentials: {
  first_name: string;
  last_name: string;
}): Promise<ApiErrorResponse | { data: { user: UserSessionData } }> {
  return await fetch(baseUrl + "/user", {
    credentials: "include",
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credentials),
  }).then(handleApiResponse);
}

export async function revokeEmailTokens(): Promise<string | ApiErrorResponse> {
  return await fetch(baseUrl + "/auth/email/token", {
    method: "DELETE",
    credentials: "include",
  }).then(handleApiResponse);
}

export async function deleteUserAccount(): Promise<string | ApiErrorResponse> {
  return await fetch(baseUrl + "/user", {
    method: "DELETE",
    credentials: "include",
  }).then(handleApiResponse);
}

export async function verifyEmailAddress(): Promise<string | ApiErrorResponse> {
  return await fetch(baseUrl + "/user/verify/email", {
    credentials: "include",
  }).then(handleApiResponse);
}

export async function verifyCode(
  code: string
): Promise<{ data: { user: UserSessionData } } | ApiErrorResponse> {
  return await fetch(baseUrl + "/user/verify/code", {
    credentials: "include",
    headers: { "content-type": "application/json" },
    method: "post",
    body: JSON.stringify({ code }),
  }).then(handleApiResponse);
}
