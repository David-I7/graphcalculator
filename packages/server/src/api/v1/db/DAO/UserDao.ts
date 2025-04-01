import { User } from "../entity/User.js";
import { DB } from "../index.js";

export interface IUserDao {
  existsEmail(email: string): Promise<boolean>;
  createUser?(user: User): Promise<boolean>;
  deleteUser?(user: User): Promise<boolean>;
}

export class UserDao implements IUserDao {
  async existsEmail(email: string): Promise<boolean> {
    const res = await DB.query<Pick<User, "email">>(
      "Select email from users where email = $1",
      [email]
    );
    return res.rows.length > 0;
  }
}
