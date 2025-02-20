import React, { useMemo } from "react";
import { useAppSelector } from "../../../state/hooks";
import { GraphFunctionExpression } from "./GraphFunctionExpression";

const GraphFunctions = () => {
  const expressions = useAppSelector(
    (state) => state.graphSlice.currentGraph.expressions
  );

  const functionExpressions = useMemo(() => {
    return expressions.filter((expr) => expr.type === "expression");
  }, [expressions.length]);

  return (
    <>
      {functionExpressions.map((expr) => (
        <GraphFunctionExpression key={expr.id} expr={expr} />
      ))}
    </>
  );
};

export default GraphFunctions;
