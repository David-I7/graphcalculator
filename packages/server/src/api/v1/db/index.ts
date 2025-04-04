import pg, { QueryResultRow } from "pg";
const { Pool } = pg;

export class DB {
  private _pool: pg.Pool;
  constructor() {
    this._pool = new Pool({
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || "localhost",
      port:
        process.env.DB_PORT !== undefined ? Number(process.env.DB_PORT) : 5432,
      database: process.env.DB_DATABASE,
    });
  }

  async query<QueryResult extends QueryResultRow>(
    text: string,
    values?: any[]
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
