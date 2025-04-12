import { z } from "zod";

export function isEmail(email: string): boolean {
  const emailSchema = z.string().email();

  return emailSchema.safeParse(email).success;
}
export function isValidPassword(password: string | undefined) {
  return password !== undefined && password.length >= 8;
}
