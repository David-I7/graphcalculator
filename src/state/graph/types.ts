import { AssignmentNode, FunctionAssignmentNode, OperatorNode } from "mathjs";

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
  color: string;
  hidden: boolean;
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
      }
    : {
        type: T;
        content: string;
        settings: ExpressionSettings;
      };

// Client State

export type ClientGraphData = Omit<GraphData, "items"> & {
  items: {
    nextId: number;
    focusedId: number;
    scope: Record<string, number>;
    data: ClientItem[];
  };
};

export type ClientExpressionState<T extends ExpressionType = ExpressionType> =
  Expression<T> & ClientExpressionData[T];

export type ClientItem<T extends keyof ItemData = ItemType> = Omit<
  Item,
  "data"
> & {
  data: ClientItemData[T];
};

export type ClientItemData<T extends ExpressionType = ExpressionType> = Omit<
  ItemData,
  "expression"
> & {
  expression: ClientExpressionState<T>;
};

export type GraphableExpressions =
  | ClientExpressionState<"function">
  | ClientExpressionState<"point">;

export type ClientExpressionData = {
  function: {
    state: FnState;
  };
  point: {
    state: PointState;
  };
  variable: {
    state: VarState;
  };
};

export type PointState = {
  node: OperatorNode | undefined;
};
export type FnState = {
  f: FNode;
  df: DFNode;
  ddf: DFNode;
};
export type VarState<
  T extends AssignmentNode | undefined = AssignmentNode | undefined
> = T extends undefined
  ? { node: undefined }
  : {
      node: AssignmentNode;
      symbol: string;
      value: number;
    };

export type FNode<
  T extends FunctionAssignmentNode | undefined =
    | FunctionAssignmentNode
    | undefined
> = T extends undefined
  ? { node: undefined }
  : {
      node: FunctionAssignmentNode;
      param: string;
      inputIntercept: number | undefined;
      outputIntercepts: number[];
      f: (input: number) => number;
    };

export type DFNode<
  T extends FunctionAssignmentNode | undefined =
    | FunctionAssignmentNode
    | undefined
> = T extends undefined
  ? { node: undefined }
  : {
      node: FunctionAssignmentNode;
      criticalPoints: [number, number][];
      param: string;
      f: (input: number) => number;
    };

export type RequiredFnState = Omit<FnState, "f"> & {
  f: FNode<FunctionAssignmentNode>;
};
