export type GraphData = {
  name: string;
  id: string;
  thumb: string;
  createdAt: string;
  modifiedAt: string;
  expressions: {
    type: "note" | "expression" | "table";
    content: string;
    id: number;
    color?: string;
    hidden?: boolean;
  }[];
};

export type Expression = GraphData["expressions"][0];
export type ExpressionType = GraphData["expressions"][0]["type"];

const baseUrl = "http://localhost:5000/";

export async function getGraphs(): Promise<GraphData[] | never> {
  const data: GraphData[] = await fetch(baseUrl + "graphs").then(
    async (res) => (await res.json()) as GraphData[]
  );

  return data;
}
