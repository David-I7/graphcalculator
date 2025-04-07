import { baseUrl } from "./config";
import {
  ApiErrorResponse,
  RegisterUserData,
  UserSessionData,
  VerifyEmailResponse,
} from "./types";

function createFetchError(): ApiErrorResponse {
  return {
    error: {
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
  } else if (res.ok && !contentType) return;

  if (contentType?.startsWith("application/json")) {
    return await res.json();
  } else {
    return createFetchError();
  }
}

export async function verifyEmail(
  email: string
): Promise<ApiErrorResponse | VerifyEmailResponse> {
  return await fetch(baseUrl + "/register/verify", {
    method: "post",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  }).then(handleApiResponse);
}

export async function authenticateUser(data: {
  email: string;
  password: string;
}): Promise<UserSessionData | ApiErrorResponse> {
  return await fetch(baseUrl + "/auth", {
    method: "post",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleApiResponse);
}

export async function registerUser(
  user: RegisterUserData
): Promise<UserSessionData | ApiErrorResponse> {
  return await fetch(baseUrl + "/register", {
    method: "post",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(user),
  }).then(handleApiResponse);
}

export async function logoutUser(): Promise<void | ApiErrorResponse> {
  return await fetch(baseUrl + "/logout", { credentials: "include" }).then(
    handleApiResponse
  );
}
