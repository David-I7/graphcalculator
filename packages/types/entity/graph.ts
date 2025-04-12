export type GraphData = {
  name: string;
  id: string;
  graphSnapshot: GraphSnapshot;
  createdAt: string;
  modifiedAt: string;
  items: ItemServer[];
};

export type GraphSnapshot = {
  settings: GraphSettingsState;
  scales: ScalesState;
  image: ReturnType<HTMLCanvasElement["toDataURL"]>;
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

export type ItemServer<T extends keyof ItemData = ItemType> = {
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

export type Item<T extends keyof ItemData = ItemType> = {
  id: number;
  type: T;
  data: ItemData[T];
};

export type ItemData = {
  expression: Expression;
  note: {
    content: string;
  };
};

export type ItemType = keyof ItemData;
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
export type Expression<T extends ExpressionType = ExpressionType> =
  T extends "variable"
    ? {
        type: T;
        content: string;
        parsedContent:
          | { name: string; value: number; node: string; scopeDeps: string[] }
          | undefined;
      }
    : T extends "point"
    ? {
        type: T;
        content: string;
        parsedContent:
          | { x: number; y: number; node: string; scopeDeps: string[] }
          | undefined;
        settings: ExpressionSettings[T];
      }
    : {
        type: T;
        content: string;
        parsedContent:
          | { name: string; node: string; scopeDeps: string[] }
          | undefined;
        settings: ExpressionSettings["function"];
      };
