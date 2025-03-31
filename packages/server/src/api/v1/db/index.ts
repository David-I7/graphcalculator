import pg, { QueryResultRow } from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT !== undefined ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_DATABASE,
});

export class DB {
  static async query<QueryResult extends QueryResultRow>(
    text: string,
    values?: string[]
  ) {
    return pool.query<QueryResult>(text, values);
  }

  static async getClient() {
    return pool.connect();
  }
}
