import { baseUrl } from "./config";
import {
  ApiErrorResponse,
  isApiErrorResponse,
  RegisterUserData,
  UserSessionData,
  VerifyEmailResponse,
} from "./types";

function createFetchError(message: string = "unknown cause"): ApiErrorResponse {
  return {
    error: {
      code: -1,
      type: "network error",
      message: `Fetch error: \n${message}`,
    },
  };
}

function handleError(err: Error) {
  if (isApiErrorResponse(err)) return err;
  if (err instanceof Error) {
    return createFetchError(err.message);
  } else return createFetchError("Unknown");
}

export async function verifyEmail(
  email: string
): Promise<ApiErrorResponse | VerifyEmailResponse> {
  return await fetch(baseUrl + "/register/verify", {
    method: "post",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return await res.json();
    })
    .catch((err) => handleError(err));
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
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return await res.json();
    })
    .catch((err) => handleError(err));
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
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return await res.json();
    })
    .catch((err) => handleError(err));
}

export async function logoutUser(): Promise<void | ApiErrorResponse> {
  return await fetch(baseUrl + "/logout", { credentials: "include" })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return;
    })
    .catch((err) => handleError(err));
}
