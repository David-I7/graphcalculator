import { Expression, ExpressionType } from "../../../../lib/api/graph";
import {
  Quotes,
  Function,
  Table,
  Hidden,
  Warning,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import { toggleExpressionVisibility } from "../../../../state/graph/graph";
import { ContentError } from "./ExpressionList";

type ExpressionDynamicIslandProps<T extends ExpressionType = ExpressionType> = {
  index: number;
  item: Expression<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  error: ContentError | null;
};

const ExpressionDynamicIsland = (props: ExpressionDynamicIslandProps) => {
  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{props.index + 1}</div>
      <div className="dynamic-island__type">
        {props.error && (
          <Warning width={28} height={28}>
            <title>{props.error.message}</title>
          </Warning>
        )}
        {!props.error && (
          <>
            {props.item.type === "expression" ? (
              <>
                <ExpressionDynamicIsland.Function
                  {...(props as ExpressionDynamicIslandProps<"expression">)}
                />
              </>
            ) : props.item.type === "note" ? (
              <Quotes width={28} height={28} />
            ) : (
              <Table width={28} height={28} />
            )}
          </>
        )}
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
