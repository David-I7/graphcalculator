import { GraphData } from "@graphcalculator/types";
import DB from "../index.js";

interface IGraphDao {
  getSavedGraphs(
    id: string,
    page: number,
    limit: number
  ): Promise<{ graphs: GraphData[]; totalPages: number }>;

  putSavedGraph(id: string, graph: GraphData): Promise<boolean>;
  getSavedImages(userIds: string[]): Promise<{ image: string }[] | null>;
  deleteSavedGraph(id: string, graphId: string): Promise<string | undefined>;
}

export class GraphDao implements IGraphDao {
  async getSavedImages(userIds: string[]) {
    if (!userIds.length) throw new Error("Must specify at least one userId");

    let where: string[] = [];
    for (let i = 1; i <= userIds.length; i++) {
      where.push(`$${i}`);
    }

    try {
      const savedImage = await DB.query<{ image: string }>(
        `select image from users as u join saved_graphs as sg on sg.user_id= u.id 
        where u.id in (${where.join()})`,
        userIds
      );

      return savedImage.rows;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getSavedGraphs(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ graphs: GraphData[]; totalPages: number }> {
    try {
      const totalCount = DB.query<{ count: number }>(
        `Select count(*)::int from users as u
        join saved_graphs as sg on u.id = sg.user_id where u.id = $1;`,
        [userId]
      );
      const graphs = await DB.query<GraphData>(
        `select sg.id, name, image,modified_at,graph_snapshot,items from users as u
        join saved_graphs as sg on u.id = sg.user_id where u.id = $1
        order by modified_at desc limit $2 offset $3;`,

        [userId, limit, limit * (page - 1)]
      );

      const totalPages = Math.ceil((await totalCount).rows[0].count / limit);
      return { graphs: graphs.rows, totalPages };
    } catch (err) {
      console.log(err);
      return { graphs: [], totalPages: 1 };
    }
  }

  async putSavedGraph(userId: string, graph: GraphData): Promise<boolean> {
    try {
      await DB.query(
        `insert into saved_graphs values ($1,$2,$3,$4,$5,$6,$7) on conflict (user_id,id) 
        do update set name=$3, modified_at=$4, graph_snapshot=$5, items=$6, image=$7;`,
        [
          graph.id,
          userId,
          graph.name,
          graph.modified_at,
          JSON.stringify(graph.graph_snapshot),
          JSON.stringify(graph.items),
          graph.image,
        ]
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async deleteSavedGraph(
    userId: string,
    graphId: string
  ): Promise<string | undefined> {
    try {
      const res = await DB.query<{ image: string }>(
        `delete from saved_graphs where user_id = $1 and id = $2 returning image;`,
        [userId, graphId]
      );

      return res.rows[0].image;
    } catch (err) {
      return;
    }
  }
}
