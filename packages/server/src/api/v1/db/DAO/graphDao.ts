import { GraphData } from "@graphcalculator/types";
import DB from "../index.js";

interface IGraphDao {
  getSavedGraphs(
    id: string,
    page?: number,
    limit?: number
  ): Promise<GraphData[]>;
}

export class GraphDao implements IGraphDao {
  async getSavedGraphs(
    id: string,
    page: number = 1,
    limit: number = 25
  ): Promise<GraphData[]> {
    try {
      const res = await DB.query<GraphData>(
        `select jsonb_array_elements_text(saved_graphs) as graphs 
            from users where id = $1 limit $2 offset $3`,
        [id, limit, limit * (page - 1)]
      );
      console.table(res.rows);
      return res.rows;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}
