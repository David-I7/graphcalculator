export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  email_is_verified: boolean;
  password: string;
}
