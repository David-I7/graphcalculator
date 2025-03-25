import { GraphData } from "../../state/graph/types";

const baseUrl = "http://localhost:5000/";

export async function getGraphs(): Promise<GraphData[] | never> {
  const data: GraphData[] = await fetch(baseUrl + "graphs").then(
    async (res) => (await res.json()) as GraphData[]
  );

  return data;
}
