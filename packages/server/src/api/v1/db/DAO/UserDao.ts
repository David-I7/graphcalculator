import { User, UserSessionData } from "@graphcalculator/types";
import DB from "../index.js";

export interface IUserDao {
  existsEmail(email: string): Promise<boolean>;
  findUserByColumnName<
    Column extends keyof User,
    ReturnFields extends (keyof User)[]
  >(
    column: Column,
    columnValue: User[Column],
    fields: ReturnFields | "*"
  ): Promise<Pick<User, ReturnFields[number]> | undefined>;
  upsertUser(
    user: Omit<User, "email_is_verified" | "id" | "provider" | "role">
  ): Promise<UserSessionData>;
  upsertUserFromProvider(
    user: Omit<User, "password" | "id" | "role">
  ): Promise<UserSessionData>;
  updateUserById<T extends (keyof User)[]>(
    id: string,
    fields: T,
    values: User[T[number]][]
  ): Promise<boolean>;
  deleteUsers(userIds: string[]): Promise<boolean>;
}

export class UserDao implements IUserDao {
  async deleteUsers(userIds: string[]): Promise<boolean> {
    if (userIds.length < 1) throw new Error("Must specify at least one userId");

    let where: string[] = [];
    for (let i = 1; i <= userIds.length; i++) {
      where.push(`$${i}`);
    }

    try {
      const res = await DB.query<{ id: string }>(
        `delete from users where id in (${where.join()}) returning id;`,
        userIds
      );

      if (res.rows.length !== userIds.length) {
        const failed = res.rows.filter((obj) => {
          return userIds.includes(obj.id);
        });

        failed.forEach((user) =>
          console.log("Failed to delete userId: ", user.id)
        );
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

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

  async findUserByColumnName<
    Column extends keyof User,
    ReturnFields extends (keyof User)[]
  >(
    column: Column,
    columnValue: User[Column],
    fields: ReturnFields | "*"
  ): Promise<Pick<User, ReturnFields[number]> | undefined> {
    try {
      if (fields === "*") {
        const res = await DB.query<User>(
          `Select * from users where ${column} = $1`,
          [columnValue]
        );

        return res.rows.length ? res.rows[0] : undefined;
      } else {
        const res = await DB.query<User>(
          `Select ${fields.join()} from users where ${column} = $1`,
          [columnValue]
        );

        return res.rows.length ? res.rows[0] : undefined;
      }
    } catch (err) {
      return undefined;
    }
  }

  async upsertUser(
    user: Omit<User, "email_is_verified" | "id" | "provider" | "role">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,password) 
      values ($1,$2,$3,$4) on conflict (email) do update set email = users.email returning email,first_name,last_name,email_is_verified,id,provider,role;`,
      [user.email, user.first_name, user.last_name, user.password]
    );

    return res.rows[0];
  }
  async upsertUserFromProvider(
    user: Omit<User, "password" | "id" | "role">
  ): Promise<UserSessionData> {
    const res = await DB.query<UserSessionData>(
      `Insert into users (email,first_name,last_name,email_is_verified,provider) 
      values ($1,$2,$3,$4,$5) on conflict (email) do update set email = users.email returning email,first_name,last_name,email_is_verified,id,provider,role;`,
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
