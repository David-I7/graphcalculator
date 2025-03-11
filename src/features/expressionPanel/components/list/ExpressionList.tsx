import React, { useCallback, useEffect, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../../components/svgs";
import useDraggable from "../../../../hooks/useDraggable";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import {
  createItem,
  deleteItem,
  updateItemPos,
  setFocusedItem,
} from "../../../../state/graph/graph";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import {
  AnimateScale,
  KeyframeAnimationOptionsBuilder,
} from "../../../../lib/animations";
import ExpressionDynamicIsland from "./ExpressionDynamicIsland";
import ExpressionTextArea from "./ExpressionTextArea";
import {
  Expression,
  isExpression,
  Item,
  Scope,
} from "../../../../state/graph/types";
import useValidateExpression from "../../../graph/hooks/useValidateExpression";
import { GraphExpression } from "../../../graph/components/GraphExpression";

const ExpressionList = () => {
  return (
    <div className="expression-list-container">
      <ExpressionListRenderer />
    </div>
  );
};

export default ExpressionList;

function ExpressionListRenderer() {
  const {
    data: items,
    focusedId,
    scope,
    dependencyGraph,
  } = useAppSelector((state) => state.graphSlice.currentGraph.items);
  const dispatch = useAppDispatch();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const draggedMetadata = useRef<{ id: number; startPos: number }>({
    id: 0,
    startPos: 0,
  });
  const draggableContainerRef = useRef<HTMLOListElement>(null);
  const animationOptions = useRef(
    new KeyframeAnimationOptionsBuilder()
      .add("duration", CSS_VARIABLES.animationSpeedFast)
      .build()
  );

  const setup = useCallback(
    function setup(currentTarget: HTMLOListElement) {
      const id = Number(currentTarget.getAttribute("expr-id"));
      const idx = Number(currentTarget.getAttribute("item-idx"));

      if (!Number.isInteger(id) || !Number.isInteger(idx)) return;

      if (items[idx]?.id !== id) return;

      draggedMetadata.current = { id, startPos: idx };
      setIsDragging(true);
      dispatch(setFocusedItem(-1));
    },
    [items]
  );

  const cleanup = useCallback(
    function cleanup(currentTarget: HTMLOListElement) {
      const { id, startPos } = draggedMetadata.current;
      const strId = id.toString();

      let endPos: number = 0;
      let found: boolean = false;
      for (
        endPos;
        endPos < currentTarget.parentElement!.children.length;
        ++endPos
      ) {
        if (
          currentTarget.parentElement!.children[endPos].getAttribute(
            "expr-id"
          ) === strId
        ) {
          found = true;
          break;
        }
      }
      if (!found) return;

      dispatch(updateItemPos({ id, startPos, endPos }));
      setIsDragging(false);
    },
    [items]
  );

  useDraggable({
    draggableContainerRef,
    sharedClassname: "draggable",
    draggingClassname: "expression-list__li--dragging",
    proxyClassname: "dynamic-island",
    setup,
    cleanup,
  });

  useEffect(() => {
    if (items.length === 0) {
      dispatch(createItem({ type: "expression", loc: "end" }));
    }
  }, [items.length]);

  console.log(scope, dependencyGraph, items);

  return (
    <ol className="expression-list" ref={draggableContainerRef}>
      {items.length > 0 &&
        items.map((item, index) => {
          return (
            <ExpressionListItem
              scope={scope}
              focused={focusedId === item.id}
              key={item.id}
              item={item}
              idx={index}
              dispatch={dispatch}
              animationOptions={animationOptions.current}
            />
          );
        })}
      {!isDragging && (
        <li
          role="button"
          onClick={() => {
            dispatch(createItem({ type: "expression", loc: "end" }));
          }}
          className="expression-list__li--faded"
        >
          <div className="dynamic-island">
            <div className="dynamic-island__index">{items.length + 1}</div>
          </div>
        </li>
      )}
    </ol>
  );
}

type ExpressionListItemProps = {
  item: Item;
  focused: boolean;
  idx: number;
  dispatch: ReturnType<typeof useAppDispatch>;
  animationOptions: KeyframeAnimationOptions;
  scope: Scope;
};

const ExpressionListItem = React.memo(
  ({
    item,
    idx,
    dispatch,
    animationOptions,
    focused,
    scope,
  }: ExpressionListItemProps) => {
    const error = useValidateExpression({ idx, item, scope, dispatch });

    return (
      <li
        className="expression-list__li draggable"
        expr-id={item.id}
        item-idx={idx}
      >
        <ExpressionDynamicIsland
          error={error}
          dispatch={dispatch}
          item={item}
          index={idx}
        />

        <ExpressionTextArea
          item={item}
          idx={idx}
          dispatch={dispatch}
          focused={focused}
          error={error}
        />

        <ButtonTarget
          onClick={(e) => {
            e.currentTarget.disabled = true;
            e.currentTarget.parentElement!.animate(
              AnimateScale(),
              animationOptions
            );
            setTimeout(() => {
              dispatch(deleteItem({ id: item.id, idx: idx }));
            }, CSS_VARIABLES.animationSpeedFast);
          }}
          title={`Delete ${item.type} ${idx + 1}`}
          className="button--hovered"
          style={{ position: "absolute", top: "0.5rem", right: "0" }}
        >
          <Close />
        </ButtonTarget>

        {!error && (
          <GraphExpression item={item} scope={scope} focused={focused} />
        )}
      </li>
    );
  },
  (prev, cur) => {
    return (
      prev.idx === cur.idx &&
      prev.focused === cur.focused &&
      prev.item === cur.item &&
      prev.scope === cur.scope
    );
  }
);
