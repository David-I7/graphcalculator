import pg, { QueryResultRow } from "pg";
const { Pool } = pg;

export class DB {
  private _pool: pg.Pool;
  constructor() {
    this._pool = new Pool({
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST || "localhost",
      port:
        process.env.POSTGRES_PORT !== undefined
          ? Number(process.env.POSTGRES_PORT)
          : 5432,
      database: process.env.POSTGRES_DB,
    });
  }

  async query<QueryResult extends QueryResultRow>(
    text: string,
    values?: any[],
  ) {
    return this._pool.query<QueryResult>(text, values);
  }

  async getClient() {
    return this._pool.connect();
  }

  get pool(): pg.Pool {
    return this._pool;
  }
}

export default new DB();
