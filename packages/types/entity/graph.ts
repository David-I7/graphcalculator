export type GraphEntity = {
  id: string;
  user_id: string;
  name: string;
  modified_at: string;
  graph_snapshot: GraphSnapshot;
  image: string;
  items: ItemServer[];
};

export type GraphData = Omit<GraphEntity, "user_id">;

export type GraphSnapshot = {
  settings: GraphSettingsState;
  scales: ScalesState;
};

export type ScalesState = {
  zoom: number;
  scalesIndex: number;
};

export type GraphSettingsState = {
  offsetX: number;
  offsetY: number;
};

export type PredefinedColors = readonly [
  "#c74440",
  "#fa7e19",
  "#e5d438",
  "hsl(144,50%,50%)",
  "hsl(257,60%,65%)",
  "#000"
];

export type ExpressionSettings = {
  point: {
    color: PredefinedColors[number];
    hidden: boolean;
    strokeSize: number;
    opacity: number;
    pointType: PointType;
  };
  function: {
    color: PredefinedColors[number];
    hidden: boolean;
    strokeSize: number;
    lineType: "dotted" | "dashed" | "linear";
    opacity: number;
  };
};

export type PointType =
  | "circle"
  | "circleStroke"
  | "diamond"
  | "star"
  | "x"
  | "+";

export type ItemServer<T extends keyof ItemDataServer = ItemType> = {
  id: number;
  type: T;
  data: ItemDataServer[T];
};

export type ItemDataServer = {
  expression: ExpressionServer;
  note: {
    content: string;
  };
};

export type ItemType = keyof ItemDataServer;

export type ExpressionType = "function" | "variable" | "point";
export type ExpressionServer<T extends ExpressionType = ExpressionType> =
  T extends "variable"
    ? {
        type: T;
        content: string;
      }
    : T extends "function" | "point"
    ? {
        type: T;
        content: string;
        settings: ExpressionSettings[T];
      }
    : never;
