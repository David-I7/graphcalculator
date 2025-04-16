export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  email_is_verified: boolean;
  password: Buffer<ArrayBufferLike>;
  provider: number;
}

export type UserSessionData = Omit<User, "password" | "provider"> & {
  session_token: string;
};
