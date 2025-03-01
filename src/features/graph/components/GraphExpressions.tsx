import { useMemo } from "react";
import { useAppSelector } from "../../../state/hooks";
import { GraphExpression } from "./GraphExpression";
import { ClientItem } from "../../../state/graph/types";

function isGraphableExpression(item: ClientItem) {
  return (
    item.type === "expression" &&
    ((item as ClientItem<"expression">).data.type === "function" ||
      (item as ClientItem<"expression">).data.type === "point")
  );
}

const GraphExpressions = () => {
  const {
    data: items,
    focusedId,
    scope,
  } = useAppSelector((state) => state.graphSlice.currentGraph.items);

  const expressionIndexes: number[] = [];
  items.forEach((item, index) =>
    isGraphableExpression(item) ? expressionIndexes.push(index) : null
  );

  const functionExpressions = useMemo(() => {
    return items.filter((item) =>
      isGraphableExpression(item)
    ) as ClientItem<"expression">[];
  }, [items.length]);

  return (
    <>
      {functionExpressions.map((expr, index) => (
        <GraphExpression
          idx={expressionIndexes[index]}
          focused={focusedId === expr.id}
          key={expr.id}
          expr={expr}
          scope={scope}
        />
      ))}
    </>
  );
};

export default GraphExpressions;
