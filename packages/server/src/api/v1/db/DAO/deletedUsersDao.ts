import DB from "../index.js";

interface IDeletedUsersDao {
  getScheduledDeletions(): Promise<{ user_id: string }[]>;
}

export class DeletedUsersDao implements IDeletedUsersDao {
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
}
