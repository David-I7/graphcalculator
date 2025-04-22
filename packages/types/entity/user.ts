export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  email_is_verified: boolean;
  password: Buffer<ArrayBufferLike>;
  provider: number;
  role: UserRolesEnum;
}

export type UserSessionData = Omit<User, "password">;

export type UserRoles = "USER" | "ADMIN";
export enum UserRolesEnum {
  "USER" = 2093,
  "ADMIN" = 1443,
}
