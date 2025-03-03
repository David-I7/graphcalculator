import {
  Quotes,
  Function,
  Hidden,
  Warning,
  VariableAssignment,
  Point,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import { toggleExpressionVisibility } from "../../../../state/graph/graph";
import { Expression, Item, ItemType } from "../../../../state/graph/types";
import { ApplicationError } from "../../../../state/error/error";

type ExpressionDynamicIslandProps<T extends ItemType = ItemType> = {
  index: number;
  item: Item<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  error: ApplicationError | null;
};

const ExpressionDynamicIsland = (props: ExpressionDynamicIslandProps) => {
  if (props.error) {
    return (
      <div draggable className="dynamic-island">
        <div className="dynamic-island__index">
          {props.index + 1}
          <div className="dynamic-island__type">
            <Warning
              color={props.error.type !== "unknown" ? "currentColor" : "orange"}
              width={28}
              height={28}
            >
              <title>{props.error.message}</title>
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
            <ExpressionDynamicIsland.Expression
              {...(props as ExpressionDynamicIslandProps<"expression">)}
            />
          ) : (
            <Quotes width={28} height={28} />
          )}
        </>
      </div>
    </div>
  );
};

export default ExpressionDynamicIsland;

ExpressionDynamicIsland.Expression = function ({
  dispatch,
  index,
  item,
}: ExpressionDynamicIslandProps<"expression">) {
  if (!item.data.content.length) return null;

  switch (item.data.type) {
    case "function":
      return (
        <button
          onClick={(e) => {
            dispatch(
              toggleExpressionVisibility({
                hidden: !(item.data as Expression<"function">).settings.hidden,
                id: item.id,
                idx: index,
              })
            );
          }}
          aria-label={`${item.data.settings.hidden ? "Show" : "Hide"} ${
            item.type
          } ${index}`}
          style={{
            backgroundColor: item.data.settings.hidden
              ? "transparent"
              : item.data.settings.color,
          }}
          className="dynamic-island__type__function"
        >
          {item.data.settings.hidden ? (
            <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
          ) : (
            <Function width={28} height={28} style={{ cursor: "pointer" }} />
          )}
        </button>
      );
    case "variable":
      return (
        <button className="dynamic-island__type__function">
          <VariableAssignment width={28} height={28} />
        </button>
      );

    case "point":
      return (
        <button
          onClick={(e) => {
            dispatch(
              toggleExpressionVisibility({
                hidden: !(item.data as Expression<"point">).settings.hidden,
                id: item.id,
                idx: index,
              })
            );
          }}
          aria-label={`${item.data.settings.hidden ? "Show" : "Hide"} ${
            item.type
          } ${index}`}
          style={{
            backgroundColor: item.data.settings.hidden
              ? "transparent"
              : item.data.settings.color,
          }}
          className="dynamic-island__type__function"
        >
          {item.data.settings.hidden ? (
            <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
          ) : (
            <Point width={28} height={28} style={{ cursor: "pointer" }} />
          )}
        </button>
      );
  }
};
