import React from "react";
import { Expression } from "../../../lib/api/graph";
import { useAppSelector } from "../../../state/hooks";
import useMathJs from "../lib/mathjs/useMathJs";

type GraphFunctionExpressionProps = {
  expr: Expression;
};

export const GraphFunctionExpression = React.memo(
  (props: GraphFunctionExpressionProps) => {
    const expr = useAppSelector((state) =>
      state.graphSlice.currentGraph.expressions.find(
        (expr) => expr.id === props.expr.id
      )
    )!;

    useMathJs(expr);

    return null;
  },
  (prev, cur) => prev.expr.id === cur.expr.id
);
