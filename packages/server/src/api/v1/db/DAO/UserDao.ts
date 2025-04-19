import { User, UserSessionData } from "@graphcalculator/types";
import DB from "../index.js";

export interface IUserDao {
  existsEmail(email: string): Promise<boolean>;
  findUserByID<T extends (keyof User)[]>(
    email: string,
    fields: T | "*"
  ): Promise<Pick<User, T[number]> | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(
    user: Omit<User, "email_is_verified" | "id" | "provider">
  ): Promise<UserSessionData>;
  upsertUserFromProvider(
    user: Omit<User, "password" | "id">
  ): Promise<UserSessionData>;
  updateUserById<T extends (keyof User)[]>(
    id: string,
    fields: T,
    values: User[T[number]][]
  ): Promise<boolean>;
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

  async updateUserById<T extends (keyof User)[]>(
    id: string,
    fields: T,
    values: User[T[number]][]
  ): Promise<boolean> {
    if (fields.length !== values.length)
      throw new Error("'Fields' length must match 'Values' length.");
    const updateReq: string[] = [];

    for (let i = 0; i < fields.length; i++) {
      updateReq.push(fields[i]);
      updateReq.push("=");
      updateReq.push(`$${i + 1}${i === fields.length - 1 ? "" : ","}`);
    }

    values.push(id as User[T[number]]);
    try {
      await DB.query(
        `Update users set ${updateReq.join("")} where id = $${values.length};`,
        values
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async findUserByID<T extends (keyof User)[]>(
    id: string,
    fields: T | "*"
  ): Promise<Pick<User, T[number]> | undefined> {
    if (fields === "*") {
      const res = await DB.query<User>(`Select * from users where id = $1`, [
        id,
      ]);

      return res.rowCount !== null ? res.rows[0] : undefined;
    } else {
      const res = await DB.query<Pick<User, T[number]>>(
        `Select ${fields.join()} from users where id = $1`,
        [id]
      );

      return res.rowCount !== null ? res.rows[0] : undefined;
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const res = await DB.query<User>(`Select * from users where email = $1`, [
      email,
    ]);

    return res.rowCount !== null ? res.rows[0] : undefined;
  }

  async upsertUser(
    user: Omit<User, "email_is_verified" | "id" | "provider">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,password) 
      values ($1,$2,$3,$4) on conflict (email) do update set email = users.email returning email,first_name,last_name,email_is_verified,id,provider;`,
      [user.email, user.first_name, user.last_name, user.password]
    );

    return res.rows[0];
  }
  async upsertUserFromProvider(
    user: Omit<User, "password" | "id">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,email_is_verified,provider) 
      values ($1,$2,$3,$4,$5) on conflict (email) do update set email = users.email returning email,first_name,last_name,email_is_verified,id,provider;`,
      [
        user.email,
        user.first_name,
        user.last_name,
        user.email_is_verified,
        user.provider,
      ]
    );

    return res.rows[0];
  }
}
