import { User } from "../entity/user.js";
import { DB } from "../index.js";

export interface IUserDao {
  existsEmail(email: string): Promise<boolean>;
  findUserByEmail<T extends (keyof User)[]>(
    email: string,
    fields: T | "*"
  ): Promise<Pick<User, T[number]> | undefined>;
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

  async findUserByEmail<T extends (keyof User)[]>(
    email: string,
    fields: T | "*"
  ): Promise<Pick<User, T[number]> | undefined> {
    if (fields === "*") {
      const res = await DB.query<User>(`Select * from users where email = $1`, [
        email,
      ]);
      console.table(res.rows);
      return res.rowCount !== null ? res.rows[0] : undefined;
    } else {
      const res = await DB.query<Pick<User, T[number]>>(
        `Select ${fields.join()} from users where email = $1`,
        [email]
      );
      console.table(res.rows);
      return res.rowCount !== null ? res.rows[0] : undefined;
    }
  }
}
