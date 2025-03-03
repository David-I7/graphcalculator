import { useAppSelector } from "../../../state/hooks";
import { GraphExpression } from "./GraphExpression";
import { Item } from "../../../state/graph/types";

function isGraphableExpression(item: Item) {
  return (
    item.type === "expression" &&
    ((item as Item<"expression">).data.type === "function" ||
      (item as Item<"expression">).data.type === "point")
  );
}

const GraphExpressions = () => {
  const {
    data: items,
    focusedId,
    scope,
  } = useAppSelector((state) => state.graphSlice.currentGraph.items);

  const graphableExpr: Item<"expression">[] = [];
  for (let i = 0; i < items.length; ++i) {
    if (isGraphableExpression(items[i])) {
      // expressionIndexes.push(i);
      graphableExpr.push(items[i] as Item<"expression">);
    }
  }

  return (
    <>
      {graphableExpr.map((item) => (
        <GraphExpression
          focused={focusedId === item.id}
          key={item.id}
          item={item}
          scope={scope}
        />
      ))}
    </>
  );
};

export default GraphExpressions;
