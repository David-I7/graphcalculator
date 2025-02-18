import { Expression } from "../../../../lib/api/graph";
import {
  Quotes,
  Function,
  Table,
  Hidden,
  Warning,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import { toggleExpressionVisibility } from "../../../../state/graph/graph";

type ExpressionDynamicIslandProps = {
  index: number;
  item: Expression;
  dispatch: ReturnType<typeof useAppDispatch>;
};

const ExpressionDynamicIsland = ({
  index,
  item,
  dispatch,
}: ExpressionDynamicIslandProps) => {
  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{index}</div>
      <div className="dynamic-island__type">
        {item.type === "expression" ? (
          <button
            onClick={(e) => {
              dispatch(
                toggleExpressionVisibility({
                  hidden: !item.hidden,
                  id: item.id,
                  idx: index - 1,
                })
              );
            }}
            aria-label={`${item.hidden ? "Show" : "Hide"} ${
              item.type
            } ${index}`}
            style={{
              backgroundColor: item.hidden ? "transparent" : item.color,
            }}
            className="dynamic-island__type__function"
          >
            {item.hidden ? (
              <Hidden style={{ cursor: "pointer" }} />
            ) : (
              <Function style={{ cursor: "pointer" }} />
            )}
          </button>
        ) : item.type === "note" ? (
          <Quotes />
        ) : (
          <Table />
        )}
      </div>
    </div>
  );
};

export default ExpressionDynamicIsland;
