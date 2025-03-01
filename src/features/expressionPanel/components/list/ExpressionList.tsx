import React, { useCallback, useEffect, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../../components/svgs";
import useDraggable from "../../../../hooks/useDraggable";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import {
  createItem,
  deleteItem,
  updateItemPos,
} from "../../../../state/graph/graph";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import {
  AnimateScale,
  KeyframeAnimationOptionsBuilder,
} from "../../../../lib/animations";
import ExpressionDynamicIsland from "./ExpressionDynamicIsland";
import ExpressionTextArea from "./ExpressionTextArea";
import { ApplicationError, destroyError } from "../../../../state/error/error";
import { ClientItem } from "../../../../state/graph/types";

const ExpressionList = () => {
  return (
    <div className="expression-list-container">
      <ExpressionListRenderer />
    </div>
  );
};

export default ExpressionList;

function ExpressionListRenderer() {
  const { data: expressions, focusedId } = useAppSelector(
    (state) => state.graphSlice.currentGraph.items
  );
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

      if (expressions[idx]?.id !== id) return;

      draggedMetadata.current = { id, startPos: idx };
      setIsDragging(true);
    },
    [expressions]
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
    [expressions]
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
    if (expressions.length === 0) {
      dispatch(createItem({ type: "expression", loc: "end" }));
    }
  }, [expressions.length]);

  return (
    <ol className="expression-list" ref={draggableContainerRef}>
      {expressions.length > 0 &&
        expressions.map((item, index) => {
          return (
            <ExpressionListItem
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
            <div className="dynamic-island__index">
              {expressions.length + 1}
            </div>
          </div>
        </li>
      )}
    </ol>
  );
}

type ExpressionListItemProps = {
  item: ClientItem;
  focused: boolean;
  idx: number;
  dispatch: ReturnType<typeof useAppDispatch>;
  animationOptions: KeyframeAnimationOptions;
};

const ExpressionListItem = React.memo(
  ({
    item,
    idx,
    dispatch,
    animationOptions,
    focused,
  }: ExpressionListItemProps) => {
    const [err, setErr] = useState<ApplicationError | null>(null);

    useEffect(() => {
      if (item.type !== "expression") return;
      //validate
    }, [item.data.content]);

    return (
      <li
        className="expression-list__li draggable"
        expr-id={item.id}
        item-idx={idx}
      >
        <ExpressionDynamicIsland
          error={err}
          dispatch={dispatch}
          item={item}
          index={idx}
        />

        <ExpressionTextArea
          item={item}
          idx={idx}
          dispatch={dispatch}
          focused={focused}
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
              dispatch(destroyError(item.id));
            }, CSS_VARIABLES.animationSpeedFast);
          }}
          title={`Delete ${item.type} ${idx + 1}`}
          className="button--hovered"
          style={{ position: "absolute", top: "0.5rem", right: "0" }}
        >
          <Close />
        </ButtonTarget>
      </li>
    );
  },
  (prev, cur) => {
    if (
      prev.idx === cur.idx &&
      prev.focused === cur.focused &&
      prev.item === cur.item
    )
      return true;
    return false;
  }
);
