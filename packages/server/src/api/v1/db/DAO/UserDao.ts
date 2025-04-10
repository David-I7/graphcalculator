import { User, UserSessionData } from "../entity/user.js";
import DB from "../index.js";

export interface IUserDao {
  existsEmail(email: string): Promise<boolean>;
  findUserByID<T extends (keyof User)[]>(
    email: string,
    fields: T | "*"
  ): Promise<Pick<User, T[number]> | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  createOrReturnUser(
    user: Omit<User, "email_is_verified" | "id" | "provider">
  ): Promise<Pick<User, "id">>;
  createOrReturnUserFromProvider(
    user: Omit<User, "password" | "id">
  ): Promise<Pick<User, "id">>;
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

  async findUserByID<T extends (keyof User)[]>(
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

  async findUserByEmail(email: string): Promise<User | undefined> {
    const res = await DB.query<User>(`Select * from users where email = $1`, [
      email,
    ]);
    console.table(res.rows);
    return res.rowCount !== null ? res.rows[0] : undefined;
  }

  async createOrReturnUser(
    user: Omit<User, "email_is_verified" | "id" | "provider">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,password) 
      values ($1,$2,$3,$4) on conflict (email) do nothing returning email,first_name,last_name,email_is_verified,id;`,
      [user.email, user.first_name, user.last_name, user.password]
    );

    console.table(res.rows);
    return res.rows[0];
  }
  async createOrReturnUserFromProvider(
    user: Omit<User, "password" | "id">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,email_is_verified,provider) 
      values ($1,$2,$3,$4,$5) on conflict (email) do nothing returning email,first_name,last_name,email_is_verified,id;`,
      [
        user.email,
        user.first_name,
        user.last_name,
        user.email_is_verified,
        user.provider,
      ]
    );

    console.table(res.rows);
    return res.rows[0];
  }
}
