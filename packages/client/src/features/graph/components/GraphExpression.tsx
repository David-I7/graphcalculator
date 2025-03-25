import {
  Expression,
  isExpression,
  Item,
  Scope,
} from "../../../state/graph/types";
import { GraphFunction } from "../hooks/useGraphFunction";
import { GraphPoint } from "../hooks/useGraphPoint";

export type useGraphExprProps<
  T extends "function" | "point" = "function" | "point"
> = {
  id: number;
  data: Expression<T>;
  focused: boolean;
  scope: Scope;
  graphId: string;
  prevGraphId: string;
};

export const GraphExpression = (props: {
  item: Item;
  focused: boolean;
  scope: Scope;
  graphId: string;
  prevGraphId: string;
}) => {
  if (!isExpression(props.item)) return null;

  if (props.item.data.type === "variable") return null;

  switch (props.item.data.type) {
    case "function":
      return (
        <GraphFunction
          prevGraphId={props.prevGraphId}
          graphId={props.graphId}
          id={props.item.id}
          scope={props.scope}
          focused={props.focused}
          data={props.item.data}
        />
      );
    case "point":
      return (
        <GraphPoint
          prevGraphId={props.prevGraphId}
          graphId={props.graphId}
          id={props.item.id}
          scope={props.scope}
          focused={props.focused}
          data={props.item.data}
        />
      );
    default:
      throw new Error("Unsupported expression type.");
  }
};
