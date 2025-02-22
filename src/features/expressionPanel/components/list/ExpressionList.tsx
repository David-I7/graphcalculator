import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../../components/svgs";
import useDraggable from "../../../../hooks/useDraggable";
import ResizableTextarea from "../../../../components/input/ResizableTextarea";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import {
  createExpression,
  deleteExpression,
  updateExpressionContent,
  updateExpressionPos,
} from "../../../../state/graph/graph";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import {
  AnimateScale,
  KeyframeAnimationOptionsBuilder,
} from "../../../../lib/animations";
import ExpressionDynamicIsland from "./ExpressionDynamicIsland";
import { incrementNextId } from "../../../../state/graph/nextId";
import { Expression } from "../../../../lib/api/graph";
import ExpressionTextArea from "./ExpressionTextArea";
import { parse } from "mathjs";

const ExpressionList = () => {
  const { expressions } = useAppSelector(
    (state) => state.graphSlice.currentGraph
  );
  const nextId = useAppSelector((state) => state.nextIdSlice.nextId);
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

      dispatch(updateExpressionPos({ id, startPos, endPos }));
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
      dispatch(
        createExpression({ id: nextId, type: "expression", loc: "end" })
      );
      dispatch(incrementNextId());
    }
  }, [expressions.length]);

  return (
    <div className="expression-list">
      <ol ref={draggableContainerRef}>
        {expressions.length > 0 &&
          expressions.map((item, index) => {
            return (
              <ExpressionListItem
                key={item.id}
                item={item}
                idx={index}
                autoFocus={index === expressions.length - 1 ? true : false}
                dispatch={dispatch}
                animationOptions={animationOptions.current}
              />
            );
          })}
        {!isDragging && (
          <li
            role="button"
            onClick={() => {
              dispatch(
                createExpression({ id: nextId, type: "expression", loc: "end" })
              );
              dispatch(incrementNextId());
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
    </div>
  );
};

export default ExpressionList;

type ExpressionListItemProps = {
  item: Expression;
  idx: number;
  dispatch: ReturnType<typeof useAppDispatch>;
  animationOptions: KeyframeAnimationOptions;
  autoFocus: boolean;
};

export type ContentError = {
  message: string;
};

const ExpressionListItem = React.memo(
  ({
    item,
    idx,
    dispatch,
    animationOptions,
    autoFocus,
  }: ExpressionListItemProps) => {
    const [error, setError] = useState<ContentError | null>(null);

    useEffect(() => {
      if (item.type !== "expression") return;

      let trimmedContent = item.data.content.trim();

      try {
        parse(trimmedContent);
        if (error) {
          setError(null);
        }
      } catch (err) {
        if (!error && err instanceof SyntaxError) {
          const index = Number(err.message[err.message.length - 2]);
          console.log(err.message);
          setError({
            message: `You need something on both sides of the '${
              trimmedContent[index - 1] || trimmedContent[index - 2]
            }' symbol.`,
          });
        }
      }
    }, [item.data.content, error]);

    return (
      <li
        key={item.id}
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
          autoFocus={autoFocus}
        />

        <ButtonTarget
          onClick={(e) => {
            e.currentTarget.disabled = true;
            e.currentTarget.parentElement!.animate(
              AnimateScale(),
              animationOptions
            );
            setTimeout(() => {
              dispatch(deleteExpression({ id: item.id, idx: idx }));
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
      prev.autoFocus === cur.autoFocus &&
      prev.item === cur.item
    )
      return true;
    return false;
  }
);
