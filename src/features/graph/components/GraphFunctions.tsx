import React, { useMemo } from "react";
import { useAppSelector } from "../../../state/hooks";
import { GraphFunctionExpression } from "./GraphFunctionExpression";
import { Expression } from "../../../lib/api/graph";

const GraphFunctions = () => {
  const expressions = useAppSelector(
    (state) => state.graphSlice.currentGraph.expressions
  );

  const functionIndexes: number[] = [];
  expressions.forEach((expression, index) =>
    expression.type === "expression" ? functionIndexes.push(index) : null
  );

  const functionExpressions = useMemo(() => {
    return expressions.filter(
      (expr) => expr.type === "expression"
    ) as Expression<"expression">[];
  }, [expressions.length]);

  return (
    <>
      {functionExpressions.map((expr, index) => (
        <GraphFunctionExpression
          idx={functionIndexes[index]}
          key={expr.id}
          expr={expr}
        />
      ))}
    </>
  );
};

export default GraphFunctions;
