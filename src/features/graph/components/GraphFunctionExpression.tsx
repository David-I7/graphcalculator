import React from "react";
import { Expression } from "../../../lib/api/graph";
import { useAppSelector } from "../../../state/hooks";
import useMathJs from "../lib/mathjs/useMathJs";

type GraphFunctionExpressionProps = {
  expr: Expression<"expression">;
  idx: number;
};

export const GraphFunctionExpression = React.memo(
  (props: GraphFunctionExpressionProps) => {
    const expr = useAppSelector(
      (state) => state.graphSlice.currentGraph.expressions[props.idx]
    )! as Expression<"expression">;

    useMathJs(expr);

    return null;
  },
  (prev, cur) => prev.expr.id === cur.expr.id && prev.idx === cur.idx
);
