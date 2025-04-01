import { baseUrl } from "./config";
import { ApiErrorResponse, VerifyEmailResponse } from "./types";

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
    .catch((err) => err);
}
