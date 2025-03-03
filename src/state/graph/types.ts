import {
  AssignmentNode,
  FunctionAssignmentNode,
  OperatorNode,
  ParenthesisNode,
} from "mathjs";

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
        parsedContent: { name: string; value: number } | undefined;
      }
    : T extends "point"
    ? {
        type: T;
        content: string;
        parsedContent: { x: number; y: number } | undefined;
        settings: ExpressionSettings;
      }
    : {
        type: T;
        content: string;
        parsedContent: string | undefined;
        settings: ExpressionSettings;
      };

// Client State

export type Scope = {
  [index: string]: ((input: number) => number) | number;
};

export type ClientGraphData = Omit<GraphData, "items"> & {
  items: {
    nextId: number;
    focusedId: number;
    scope: Scope;
    data: Item[];
  };
};

// export type ClientExpressionState<T extends ExpressionType = ExpressionType> =
//   Expression<T> & ClientExpressionData[T];

// export type ClientItem<T extends keyof ItemData = ItemType> = Omit<
//   Item,
//   "data"
// > & {
//   data: ClientItemData[T];
// };

// export type ClientItemData<T extends ExpressionType = ExpressionType> = Omit<
//   ItemData,
//   "expression"
// > & {
//   expression: ClientExpressionState<T>;
// };

// export type GraphableExpressions =
//   | ClientExpressionState<"function">
//   | ClientExpressionState<"point">;

// export type ClientExpressionData = {
//   function: {
//     clientState: string | undefined;
//   };
//   point: {
//     clientState: string | undefined;
//   };
//   variable: {
//     clientState:
//       | {
//           name: string;
//           value: number;
//         }
//       | undefined;
//   };
// };

export function isExpression(item: Item): item is Item<"expression"> {
  return item.type == "expression";
}
