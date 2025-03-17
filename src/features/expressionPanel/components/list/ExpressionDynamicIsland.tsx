import {
  Quotes,
  Function,
  Hidden,
  Warning,
  VariableAssignment,
  Point,
  Opacity,
  StrokeWidth,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import {
  changeOpacity,
  changeStrokeSize,
  toggleVisibility,
} from "../../../../state/graph/graph";
import {
  isFunction,
  isPoint,
  isVariable,
  Item,
  ItemType,
} from "../../../../state/graph/types";
import { ApplicationError } from "../../../../state/error/error";
import { useRef, useState } from "react";
import { useClickOutside } from "../../../../hooks/dom";
import Dropdown from "../../../../components/dropdown/Dropdown";
import Switch from "../../../../components/switch/Switch";
import UnderlineInput from "../../../../components/input/UnderlineInput";
import Hr from "../../../../components/hr/Hr";
import {
  ColorChips,
  ExpressionSettingsMenu,
  FunctionChips,
} from "./ExpressionSettings";

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
            <Function
              type={item.data.settings.lineType}
              width={28}
              height={28}
              style={{ cursor: "pointer" }}
            />
          )}
        </Dropdown.Button>

        <Dropdown.CustomMenu Menu={ExpressionSettingsMenu}>
          <div className="expression-settings-header">
            Lines
            <Switch
              onChange={(e) => {
                dispatch(
                  toggleVisibility({
                    id: item.id,
                    idx: index,
                  })
                );
              }}
              checked={!item.data.settings.hidden}
            />
          </div>
          <div className="expression-settings-body">
            <div className="expression-settings-body-left">
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  alignItems: "center",
                }}
              >
                <Opacity width={14} height={14} />
                <UnderlineInput
                  min={0}
                  max={1}
                  defaultValue={item.data.settings.opacity}
                  onChange={(e) => {
                    dispatch(
                      changeOpacity({
                        id: item.id,
                        idx: index,
                        opacity: isNaN(Number(e.target.value))
                          ? 1
                          : Number(e.target.value),
                      })
                    );
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  alignItems: "center",
                }}
              >
                <StrokeWidth width={14} height={14} />
                <UnderlineInput
                  min={0}
                  max={10}
                  defaultValue={item.data.settings.strokeSize}
                  onChange={(e) => {
                    dispatch(
                      changeStrokeSize({
                        id: item.id,
                        idx: index,
                        strokeSize: isNaN(Number(e.target.value))
                          ? 3
                          : Number(e.target.value),
                      })
                    );
                  }}
                />
              </div>
            </div>
            <div className="expression-settings-body-right">
              <FunctionChips
                idx={index}
                id={item.id}
                selected={item.data.settings.lineType}
              />
            </div>
          </div>
          <Hr style={{ marginBlock: "1rem" }} />
          <div className="expression-settings-footer">
            <ColorChips
              selected={item.data.settings.color}
              id={item.id}
              idx={index}
            />
          </div>
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
            toggleVisibility({
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
