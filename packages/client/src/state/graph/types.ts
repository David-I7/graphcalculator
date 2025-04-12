import type {
  Expression,
  GraphData,
  Item,
  ItemData,
} from "@graphcalculator/types";
export type {
  Expression,
  GraphData,
  Item,
  ItemData,
} from "@graphcalculator/types";
import { SerializedAdjList } from "../../helpers/dts";

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
  isModified: boolean;
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
