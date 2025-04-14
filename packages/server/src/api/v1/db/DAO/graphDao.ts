import { GraphData } from "@graphcalculator/types";
import DB from "../index.js";

interface IGraphDao {
  getSavedGraphs(
    id: string,
    page?: number,
    limit?: number
  ): Promise<GraphData[]>;

  putSavedGraph(id: string, graph: GraphData): Promise<boolean>;
}

export class GraphDao implements IGraphDao {
  async getSavedGraphs(
    id: string,
    page: number = 1,
    limit: number = 25
  ): Promise<GraphData[]> {
    try {
      // const res = await DB.query<GraphData>(
      //   `select value from users, jsonb_each(saved_graphs)
      //    where id = $1 limit $2 offset $3`,
      //   [id, limit, limit * (page - 1)]
      // );
      // console.log(res.rows);
      // return res.rows;
      return [];
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async putSavedGraph(userId: string, graph: GraphData): Promise<boolean> {
    try {
      const res = await DB.query(
        `insert into saved_graphs values ($1,$2,$3,$4,$5,$6)`,
        [
          graph.id,
          userId,
          graph.name,
          graph.modified_at,
          graph.graph_snapshot,
          graph.items,
        ]
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
