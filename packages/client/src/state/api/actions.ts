import { baseUrl } from "./config";
import { ApiErrorResponse, VerifyEmailResponse } from "./types";

function createFetchError(message: string = "unknown cause"): ApiErrorResponse {
  return {
    error: {
      code: -1,
      type: "network error",
      message: `Fetch error: \n${message}`,
    },
  };
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
    .catch((err) => {
      if ("error" in err) return err;
      return createFetchError(
        typeof err === "object" && "message" in err && err.message
      );
    });
}

export async function validatePassword(data: {
  email: string;
  password: string;
}) {
  return await fetch(baseUrl + "/auth", {
    method: "post",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return await res.json();
    })
    .catch((err) => {
      if ("error" in err) return err;
      return createFetchError(
        typeof err === "object" && "message" in err && err.message
      );
    });
}
