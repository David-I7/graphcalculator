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
import {
  Expression,
  isExpression,
  isFunction,
  isPoint,
  isVariable,
  Item,
  ItemType,
} from "../../../../state/graph/types";
import { ApplicationError } from "../../../../state/error/error";
import {
  JSX,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClickOutside } from "../../../../hooks/dom";
import Dropdown, {
  UserContentProps,
} from "../../../../components/dropdown/Dropdown";
import { usePopulateRef } from "../../../../hooks/reactutils";

type ExpressionDynamicIslandProps<T extends ItemType = ItemType> = {
  index: number;
  item: Item<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  error: ApplicationError | null;
};

const ExpressionDynamicIsland = (props: ExpressionDynamicIslandProps) => {
  if (props.error) {
    return (
      <ExpressionDynamicIsland.Error
        error={props.error}
        pos={props.index + 1}
      />
    );
  }

  if (!props.item.data.content.length)
    return (
      <div draggable className="dynamic-island">
        <div className="dynamic-island__index">{props.index + 1}</div>
        <div className="dynamic-island__type"></div>
      </div>
    );

  return (
    <>
      {props.item.type === "expression" ? (
        <ExpressionDynamicIsland.Expression
          {...(props as ExpressionDynamicIslandProps<"expression">)}
        />
      ) : (
        <ExpressionDynamicIsland.Note pos={props.index + 1} />
      )}
    </>
  );
};

export default ExpressionDynamicIsland;

ExpressionDynamicIsland.Note = ({ pos }: { pos: number }) => {
  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{pos}</div>
      <div className="dynamic-island__type">
        <Quotes width={28} height={28} />
      </div>
    </div>
  );
};

ExpressionDynamicIsland.Expression = function ({
  dispatch,
  index,
  item,
}: ExpressionDynamicIslandProps<"expression">) {
  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{index + 1}</div>
      {item.data.type === "function" ? (
        <ExpressionDynamicIsland.Function
          dispatch={dispatch}
          index={index}
          item={item}
        />
      ) : item.data.type === "variable" ? (
        <ExpressionDynamicIsland.Variable item={item} />
      ) : (
        <ExpressionDynamicIsland.Point
          dispatch={dispatch}
          index={index}
          item={item}
        />
      )}
    </div>
  );
};

ExpressionDynamicIsland.Function = ({
  item,
  dispatch,
  index,
}: Omit<ExpressionDynamicIslandProps<"expression">, "error">) => {
  if (!isFunction(item.data)) return null;

  return (
    <div className="dynamic-island__type">
      {/* <button
        onClick={(e) => {
          dispatch(
            toggleExpressionVisibility({
              //@ts-ignore
              hidden: !item.data.settings.hidden,
              id: item.id,
              idx: index,
            })
          );
        }}
        aria-label={`${item.data.settings.hidden ? "Show" : "Hide"} ${
          item.type
        } ${index + 1}`}
        style={{
          backgroundColor: item.data.settings.hidden
            ? "transparent"
            : item.data.settings.color,
        }}
        className="dynamic-island-type-function"
      >
        {item.data.settings.hidden ? (
          <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
        ) : (
          <Function width={28} height={28} style={{ cursor: "pointer" }} />
        )}
      </button> */}
      <Dropdown>
        <Dropdown.Button
          aria-label={`${item.data.settings.hidden ? "Show" : "Hide"} ${
            item.type
          } ${index + 1}`}
          style={{
            padding: 0,
            borderRadius: "100px",
            overflow: "hidden",
            height: "1.75rem",
            backgroundColor: item.data.settings.hidden
              ? "transparent"
              : item.data.settings.color,
          }}
        >
          {item.data.settings.hidden ? (
            <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
          ) : (
            <Function width={28} height={28} style={{ cursor: "pointer" }} />
          )}
        </Dropdown.Button>

        <Dropdown.CustomMenu Menu={SettingsMenu}>
          <div>Lines</div>
          <div>
            <div></div>
            <div></div>
          </div>
          <hr></hr>
          <div></div>
        </Dropdown.CustomMenu>
      </Dropdown>
    </div>
  );
};
ExpressionDynamicIsland.Point = ({
  item,
  dispatch,
  index,
}: Omit<ExpressionDynamicIslandProps<"expression">, "error">) => {
  if (!isPoint(item.data)) return null;

  return (
    <div className="dynamic-island__type">
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
        } ${index + 1}`}
        style={{
          backgroundColor: item.data.settings.hidden
            ? "transparent"
            : item.data.settings.color,
        }}
        className="dynamic-island-type-function"
      >
        {item.data.settings.hidden ? (
          <Hidden style={{ cursor: "pointer" }} width={28} height={28} />
        ) : (
          <Point width={28} height={28} style={{ cursor: "pointer" }} />
        )}
      </button>
    </div>
  );
};

ExpressionDynamicIsland.Variable = ({
  item,
}: Omit<
  ExpressionDynamicIslandProps<"expression">,
  "error" | "dispatch" | "index"
>) => {
  if (!isVariable(item.data)) return null;

  return (
    <div className="dynamic-island__type">
      <VariableAssignment width={28} height={28} />
    </div>
  );
};

ExpressionDynamicIsland.Error = ({
  error,
  pos,
}: {
  error: ApplicationError;
  pos: number;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useClickOutside(isOpen, errorRef, () => setIsOpen(false));

  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">
        {pos}

        <div
          onClick={(e) => {
            if (isOpen && e.target === errorRef.current) return;
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="dynamic-island__type"
        >
          <Warning width={28} height={28}>
            <title>{error.message}</title>
          </Warning>
          {isOpen && (
            <div ref={errorRef} className="dynamic-island__error">
              {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function SettingsMenu({
  setIsOpen,
  ariaControlsId,
  isOpen,
  children,
}: UserContentProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const expressionListRef = useRef<HTMLDivElement>(null);

  usePopulateRef(expressionListRef, {
    cb() {
      return document.querySelector(
        ".expression-list-container"
      ) as HTMLDivElement;
    },
  });

  useEffect(() => {
    if (!expressionListRef.current || !menuRef.current) return;

    if (
      expressionListRef.current.scrollHeight ===
      expressionListRef.current.offsetHeight
    )
      return;

    const expressionListRefCurrent = expressionListRef.current;

    const repositionMenu = () => {
      if (!expressionListRefCurrent || !menuRef.current) return;

      const menuRect = menuRef.current.getBoundingClientRect();
      const padding = 12;
      const overflow =
        expressionListRefCurrent.offsetTop +
        expressionListRefCurrent.offsetHeight -
        menuRect.bottom;

      if (overflow < 0) {
        menuRef.current.style.transform = `translateY(max(${
          overflow - padding
        }px,calc(-100% + 2rem)))`;
      }
    };

    repositionMenu();
  }, [isOpen]);

  return (
    <>
      <div
        ref={menuRef}
        className="expression-settings"
        id={ariaControlsId}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <div className="expression-settings-triangle"></div>
    </>
  );
}
