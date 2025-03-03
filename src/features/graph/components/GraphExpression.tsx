import React, { useMemo, useRef } from "react";
import { Expression, Item, ItemData, Scope } from "../../../state/graph/types";
import { useGraphContext } from "../Graph";
import { Graph } from "../lib/graph/graph";
import useGraphFunction from "../lib/mathjs/useGraphFunction";

type GraphExpressionProps = {
  item: Item<"expression">;
  focused: boolean;
  scope: Scope;
};

export const GraphExpression = React.memo((props: GraphExpressionProps) => {
  const graph = useGraphContext();

  if (!graph) return;

  switch (props.item.data.type) {
    case "function":
      return (
        <GraphFunction
          graph={graph}
          focused={props.focused}
          data={props.item.data as Expression<"function">}
          id={props.item.id}
          scope={props.scope}
        />
      );

    case "point":
      return "";
  }

  throw new Error(
    `Type ${props.item.data.type} is not of type function or point`
  );
});

const GraphFunction = ({
  data,
  id,
  focused,
  graph,
  scope,
}: Omit<GraphExpressionProps, "item"> & {
  id: number;
  data: Expression<"function">;
  graph: Graph;
  scope: Scope;
}) => {
  useGraphFunction({ id, focused, data, graph, scope });

  return null;
};
