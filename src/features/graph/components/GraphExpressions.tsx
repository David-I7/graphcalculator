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
  const { data: items, focusedId } = useAppSelector(
    (state) => state.graphSlice.currentGraph.items
  );

  const expressionIndexes: number[] = [];
  const graphableExpr: ClientItem<"expression">[] = [];
  for (let i = 0; i < items.length; ++i) {
    if (isGraphableExpression(items[i])) expressionIndexes.push(i);
    graphableExpr.push(items[i] as ClientItem<"expression">);
  }

  return (
    <>
      {graphableExpr.map((item) => (
        <GraphExpression
          focused={focusedId === item.id}
          key={item.id}
          item={item}
        />
      ))}
    </>
  );
};

export default GraphExpressions;
