export type GraphData = {
  name: string;
  id: string;
  thumb: string;
  createdAt: string;
  modifiedAt: string;
  expressions: Expression[];
};

type ExpressionData = {
  expression: {
    content: string;
    color?: string;
    hidden?: boolean;
  };
  note: {
    content: string;
  };
  table: {
    content: string;
  };
};

export type Expression<T extends ExpressionType = ExpressionType> = {
  type: T;
  id: number;
  data: ExpressionData[T];
};
export type ExpressionType = keyof ExpressionData;

const baseUrl = "http://localhost:5000/";

export async function getGraphs(): Promise<GraphData[] | never> {
  const data: GraphData[] = await fetch(baseUrl + "graphs").then(
    async (res) => (await res.json()) as GraphData[]
  );

  return data;
}
