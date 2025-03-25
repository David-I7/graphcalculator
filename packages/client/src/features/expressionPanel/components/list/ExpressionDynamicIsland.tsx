import {
  Quotes,
  Function,
  Hidden,
  Warning,
  VariableAssignment,
  Point,
} from "../../../../components/svgs";
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
import {
  ExpressionSettingsMenu,
  ExpressionSettingsMenuItems,
} from "./ExpressionSettings";

type ExpressionDynamicIslandProps<T extends ItemType = ItemType> = {
  index: number;
  item: Item<T>;
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
  index,
  item,
}: ExpressionDynamicIslandProps<"expression">) {
  return (
    <div draggable className="dynamic-island">
      <div className="dynamic-island__index">{index + 1}</div>
      {item.data.type === "function" ? (
        <ExpressionDynamicIsland.Function index={index} item={item} />
      ) : item.data.type === "variable" ? (
        <ExpressionDynamicIsland.Variable item={item} />
      ) : (
        <ExpressionDynamicIsland.Point index={index} item={item} />
      )}
    </div>
  );
};

ExpressionDynamicIsland.Function = ({
  item,
  index,
}: Omit<ExpressionDynamicIslandProps<"expression">, "error" | "dispatch">) => {
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
          <ExpressionSettingsMenuItems
            id={item.id}
            itemData={item.data}
            idx={index}
          />
        </Dropdown.CustomMenu>
      </Dropdown>
    </div>
  );
};
ExpressionDynamicIsland.Point = ({
  item,
  index,
}: Omit<ExpressionDynamicIslandProps<"expression">, "error">) => {
  if (!isPoint(item.data)) return null;

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
            <Point
              fill="white"
              stroke="white"
              pointType={item.data.settings.pointType}
              width={28}
              height={28}
              style={{ cursor: "pointer" }}
            />
          )}
        </Dropdown.Button>

        <Dropdown.CustomMenu Menu={ExpressionSettingsMenu}>
          <ExpressionSettingsMenuItems
            id={item.id}
            itemData={item.data}
            idx={index}
          />
        </Dropdown.CustomMenu>
      </Dropdown>
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
