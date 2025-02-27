import { Expression, ExpressionType } from "../../../../lib/api/graph";
import {
  Quotes,
  Function,
  Table,
  Hidden,
  Warning,
} from "../../../../components/svgs";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { toggleExpressionVisibility } from "../../../../state/graph/graph";

type ExpressionDynamicIslandProps<T extends ExpressionType = ExpressionType> = {
  index: number;
  item: Expression<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
};

const ExpressionDynamicIsland = (props: ExpressionDynamicIslandProps) => {
  const error = useAppSelector(
    (state) => state.errorSlice.errors.expressions[props.item.id]
  );

  if (!props.item.data.content.length)
    return (
      <div draggable className="dynamic-island">
        <div className="dynamic-island__index">
          {props.index + 1}
          <div className="dynamic-island__type"></div>
        </div>
      </div>
    );

  if (error) {
    return (
      <div draggable className="dynamic-island">
        <div className="dynamic-island__index">
          {props.index + 1}
          <div className="dynamic-island__type">
            <Warning
              color={error.type !== "unknown" ? "currentColor" : "orange"}
              width={28}
              height={28}
            >
              <title>{error.message}</title>
            </Warning>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{props.index + 1}</div>
      <div className="dynamic-island__type">
        <>
          {props.item.type === "expression" ? (
            <ExpressionDynamicIsland.Function
              {...(props as ExpressionDynamicIslandProps<"expression">)}
            />
          ) : props.item.type === "note" ? (
            <Quotes width={28} height={28} />
          ) : (
            <Table width={28} height={28} />
          )}
        </>
      </div>
    </div>
  );
};

export default ExpressionDynamicIsland;

ExpressionDynamicIsland.Function = function ({
  dispatch,
  index,
  item,
}: ExpressionDynamicIslandProps<"expression">) {
  return (
    <button
      onClick={(e) => {
        dispatch(
          toggleExpressionVisibility({
            hidden: !item.data.hidden,
            id: item.id,
            idx: index,
          })
        );
      }}
      aria-label={`${item.data.hidden ? "Show" : "Hide"} ${item.type} ${index}`}
      style={{
        backgroundColor: item.data.hidden ? "transparent" : item.data.color,
      }}
      className="dynamic-island__type__function"
    >
      {item.data.hidden ? (
        <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
      ) : (
        <Function width={28} height={28} style={{ cursor: "pointer" }} />
      )}
    </button>
  );
};
