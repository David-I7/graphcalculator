import DB from "../index.js";

interface IDeletedUsersDao {
  getScheduledDeletions(): Promise<{ user_id: string }[]>;
  scheduleDelete(userId: string): Promise<boolean>;
  revokeScheduledDeleteIfExists(userId: string): Promise<boolean>;
}

export class DeletedUsersDao implements IDeletedUsersDao {
  private SCHEDULE_DEADLINE: number = 1000 * 60 * 60 * 24 * 30; // 30 days

  async getScheduledDeletions(): Promise<{ user_id: string }[]> {
    try {
      const deletedUsers = await DB.query<{ user_id: string }>(
        `Select user_id from deleted_users where schedule_date < now();`
      );

      return deletedUsers.rows;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async scheduleDelete(userId: string): Promise<boolean> {
    const schedule_date =
      (new Date().getTime() + this.SCHEDULE_DEADLINE) * 1e-3;
    try {
      await DB.query(
        `insert into deleted_users values (to_timestamp(${schedule_date}),$1) on conflict (user_id) DO NOTHING;`,
        [userId]
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async revokeScheduledDeleteIfExists(userId: string): Promise<boolean> {
    try {
      const res = await DB.query<{ user_id: string }>(
        `delete from deleted_users where user_id = $1 returning user_id;`,
        [userId]
      );

      return res.rows.length ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
