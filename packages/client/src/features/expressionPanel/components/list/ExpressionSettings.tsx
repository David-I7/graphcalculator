import { useEffect, useRef } from "react";
import {
  Line,
  Opacity,
  Point,
  StrokeWidth,
  Triangle,
} from "../../../../components/svgs";
import FilterChip from "../../../../components/chips/FilterChip";
import { UserContentProps } from "../../../../components/dropdown/Dropdown";
import { usePopulateRef } from "../../../../hooks/reactutils";
import type {
  Expression,
  ExpressionSettings,
  PointType,
} from "../../../../state/graph/types";
import { useAppDispatch } from "../../../../state/hooks";
import {
  changeColor,
  changeLineType,
  changeOpacity,
  changePointType,
  changeStrokeSize,
  toggleVisibility,
} from "../../../../state/graph/graph";
import { PREDEFINED_COLORS } from "../../../../data/css/variables";
import Switch from "../../../../components/switch/Switch";
import UnderlineInput from "../../../../components/input/UnderlineInput";
import Hr from "../../../../components/hr/Hr";

const functionLineTypes: ExpressionSettings["function"]["lineType"][] = [
  "linear",
  "dashed",
  "dotted",
];

const pointTypes: PointType[] = [
  "circle",
  "circleStroke",
  "diamond",
  "+",
  "x",
  "star",
];

export function ExpressionSettingsMenu({
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

    const currentMenu = menuRef.current;
    const eController = new AbortController();

    currentMenu.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
      },
      {
        passive: false,
        signal: eController.signal,
      }
    );

    if (
      expressionListRef.current.scrollHeight !==
      expressionListRef.current.offsetHeight
    ) {
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
    }

    return () => {
      eController.abort();
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={menuRef}
        className="expression-settings"
        id={ariaControlsId}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
      <div className="expression-settings-triangle-mask"></div>
      <Triangle
        width={14}
        height={14}
        className="expression-settings-triangle"
      ></Triangle>
    </>
  );
}

export function ExpressionSettingsMenuItems({
  id,
  idx,
  itemData,
}: ItemIdentifier & { itemData: Expression<"function" | "point"> }) {
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="expression-settings-header">
        {itemData.type === "function" ? "Lines" : "Points"}
        <Switch
          onChange={() => {
            dispatch(
              toggleVisibility({
                id: id,
                idx: idx,
              })
            );
          }}
          checked={!itemData.settings.hidden}
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
              defaultValue={itemData.settings.opacity}
              onChange={(e) => {
                dispatch(
                  changeOpacity({
                    id: id,
                    idx: idx,
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
              defaultValue={itemData.settings.strokeSize}
              onChange={(e) => {
                dispatch(
                  changeStrokeSize({
                    id: id,
                    idx: idx,
                    strokeSize: isNaN(Number(e.target.value))
                      ? 3
                      : Number(e.target.value),
                  })
                );
              }}
            />
          </div>
        </div>
        {itemData.type === "function" && (
          <div className="expression-settings-body-right-fn">
            <FunctionChips
              idx={idx}
              id={id}
              selected={itemData.settings.lineType}
            />
          </div>
        )}
        {itemData.type === "point" && (
          <div className="expression-settings-body-right-point">
            <PointChips
              id={id}
              idx={idx}
              selected={itemData.settings.pointType}
            />
          </div>
        )}
      </div>
      <Hr style={{ marginBlock: "1rem" }} />
      <div className="expression-settings-footer">
        <ColorChips selected={itemData.settings.color} id={id} idx={idx} />
      </div>
    </>
  );
}

type FunctionChipsProps = {
  selected: ExpressionSettings["function"]["lineType"];
};

type ItemIdentifier = { id: number; idx: number };

export function FunctionChips({
  selected,
  id,
  idx,
}: FunctionChipsProps & ItemIdentifier) {
  const dispatch = useAppDispatch();
  const handleClick = (
    lineType: ExpressionSettings["function"]["lineType"]
  ) => {
    dispatch(
      changeLineType({
        lineType,
        id,
        idx,
      })
    );
  };

  return functionLineTypes.map((type) => {
    const isSelected = type === selected;
    return (
      <FilterChip
        key={type}
        className={isSelected ? "js-selected-chip" : ""}
        onClick={() => handleClick(type)}
        isSelected={isSelected}
      >
        <Line width={14} height={14} type={type} />
      </FilterChip>
    );
  });
}

type PointChipsProps = {
  selected: PointType;
};

export function PointChips({
  selected,
  id,
  idx,
}: PointChipsProps & ItemIdentifier) {
  const dispatch = useAppDispatch();
  const handleClick = (pointType: PointType) => {
    dispatch(
      changePointType({
        pointType,
        id,
        idx,
      })
    );
  };

  return pointTypes.map((type) => {
    const isSelected = type === selected;
    return (
      <FilterChip
        key={type}
        className={isSelected ? "js-selected-chip" : ""}
        onClick={() => handleClick(type)}
        isSelected={isSelected}
      >
        <Point width={14} height={14} pointType={type} />
      </FilterChip>
    );
  });
}

type ColorChipsProps = {
  selected: (typeof PREDEFINED_COLORS)[number];
};

export function ColorChips({
  id,
  idx,
  selected,
}: ColorChipsProps & ItemIdentifier) {
  const dispatch = useAppDispatch();
  const handleClick = (color: (typeof PREDEFINED_COLORS)[number]) => {
    dispatch(
      changeColor({
        id,
        idx,
        color,
      })
    );
  };

  return PREDEFINED_COLORS.map((color) => {
    const isSelected = color === selected;
    return (
      <FilterChip
        key={color}
        onClick={() => handleClick(color)}
        className={isSelected ? "js-selected-chip" : ""}
        style={{ backgroundColor: color }}
        isSelected={isSelected}
      >
        {isSelected && <div></div>}
      </FilterChip>
    );
  });
}
