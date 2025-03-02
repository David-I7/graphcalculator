import React, { useMemo, useRef } from "react";
import { ClientExpressionState, ClientItem } from "../../../state/graph/types";
import { useGraphContext } from "../Graph";
import { Graph } from "../lib/graph/graph";
import useGraphFunction from "../lib/mathjs/useGraphFunction";

type GraphExpressionProps = {
  item: ClientItem<"expression">;
  focused: boolean;
  scope: Record<string, number>;
};

export const GraphExpression = React.memo(
  (props: GraphExpressionProps) => {
    const graph = useGraphContext();

    if (!graph) return;

    switch (props.item.data.type) {
      case "function":
        return (
          <GraphFunction
            graph={graph}
            focused={props.focused}
            data={props.item.data as ClientExpressionState<"function">}
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
  },
  (prev, cur) =>
    prev.scope === cur.scope &&
    prev.item === cur.item &&
    prev.focused === cur.focused
);

const GraphFunction = ({
  data,
  id,
  focused,
  graph,
  scope,
}: Omit<GraphExpressionProps, "item"> & {
  id: number;
  data: ClientExpressionState<"function">;
  graph: Graph;
  scope: Record<string, number>;
}) => {
  useGraphFunction({ id, focused, data, graph, scope });

  return null;
};
