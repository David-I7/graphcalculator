import React from "react";
import { useAppSelector } from "../../../state/hooks";
import useMathJs from "../lib/mathjs/useMathJs";
import { ClientItem } from "../../../state/graph/types";

type GraphFunctionExpressionProps = {
  expr: ClientItem<"expression">;
  idx: number;
  focused: boolean;
  scope: Record<string, number>;
};

export const GraphExpression = React.memo(
  (props: GraphFunctionExpressionProps) => {
    const expr = useAppSelector(
      (state) => state.graphSlice.currentGraph.items.data[props.idx]
    )! as ClientItem<"expression">;

    useMathJs(expr, props.focused, props.idx, props.scope);

    return null;
  },
  (prev, cur) =>
    prev.expr.id === cur.expr.id &&
    prev.focused === cur.focused &&
    prev.idx === cur.idx
);
