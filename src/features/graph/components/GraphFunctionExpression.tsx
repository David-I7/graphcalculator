import React from "react";
import { Expression } from "../../../lib/api/graph";
import { useAppSelector } from "../../../state/hooks";
import useMathJs from "../lib/mathjs/useMathJs";

type GraphFunctionExpressionProps = {
  expr: Expression<"expression">;
  idx: number;
  focused: boolean;
};

export const GraphFunctionExpression = React.memo(
  (props: GraphFunctionExpressionProps) => {
    const expr = useAppSelector(
      (state) => state.graphSlice.currentGraph.expressions.data[props.idx]
    )! as Expression<"expression">;

    useMathJs(expr, props.focused);

    return null;
  },
  (prev, cur) =>
    prev.expr.id === cur.expr.id &&
    prev.focused === cur.focused &&
    prev.idx === cur.idx
);
