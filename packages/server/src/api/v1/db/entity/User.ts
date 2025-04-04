export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  email_is_verified: boolean;
  password: Buffer<ArrayBufferLike>;
}

export type UserSessionData = Omit<User, "password">;
