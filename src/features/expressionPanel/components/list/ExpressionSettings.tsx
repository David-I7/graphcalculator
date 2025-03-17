import React, { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { Line, Triangle } from "../../../../components/svgs";
import FilterChip from "../../../../components/chips/FilterChip";
import { UserContentProps } from "../../../../components/dropdown/Dropdown";
import { usePopulateRef } from "../../../../hooks/reactutils";
import type { ExpressionSettings } from "../../../../state/graph/types";
import { useAppDispatch } from "../../../../state/hooks";
import { changeColor, changeLineType } from "../../../../state/graph/graph";
import { PREDEFINED_COLORS } from "../../../../data/css/variables";

const functionLineTypes: ExpressionSettings["function"]["lineType"][] = [
  "linear",
  "dashed",
  "dotted",
];

export function ExpressionSettingsMenu({
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
      <div className="expression-settings-triangle-mask"></div>
      <Triangle
        width={14}
        height={14}
        className="expression-settings-triangle"
      ></Triangle>
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

  return functionLineTypes.map((type, index) => {
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
