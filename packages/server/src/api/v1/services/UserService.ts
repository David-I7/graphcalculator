import { DB } from "../db/index.js";

type User = {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  email_is_verified: boolean;
};

export class UserService {
  static async createUser() {}

  static async existsEmail(email: string): Promise<boolean> {
    const res = await DB.query<Pick<User, "email">>(
      "Select email from users where email = $1",
      [email]
    );
    return res.rows.length > 0;
  }
}
