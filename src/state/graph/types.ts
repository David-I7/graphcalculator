import { SerializedAdjList } from "../../helpers/dts";

// API data

export type GraphData = {
  name: string;
  id: string;
  thumb: string;
  createdAt: string;
  modifiedAt: string;
  items: Item[];
};

export type ExpressionSettings = {
  point: {
    color: string;
    hidden: boolean;
    strokeSize: number;
    opacity: number;
  };
  function: {
    color: string;
    hidden: boolean;
    strokeSize: number;
    lineType: "dotted" | "dashed" | "linear";
    opacity: number;
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

// Client State

export type Scope = {
  [index: string]: ScopeValue;
};

type ScopeValue =
  | {
      type: "function";
      node: string;
      deps: string[];
    }
  | {
      type: "variable";
      node: string;
      value: number;
      deps: string[];
    };

export type InternalScope = {
  [index: string]: (() => number) | number;
};

export type ClientGraphData = Omit<GraphData, "items"> & {
  items: {
    nextId: number;
    focusedId: number;
    scope: Scope;
    dependencyGraph: SerializedAdjList;
    data: Item[];
  };
};

export function isExpression(item: Item): item is Item<"expression"> {
  return item.type == "expression";
}

export function isFunction(
  data: ItemData["expression"]
): data is Expression<"function"> {
  return data.type === "function";
}
export function isVariable(
  data: ItemData["expression"]
): data is Expression<"variable"> {
  return data.type === "variable";
}
export function isPoint(
  data: ItemData["expression"]
): data is Expression<"point"> {
  return data.type === "point";
}
