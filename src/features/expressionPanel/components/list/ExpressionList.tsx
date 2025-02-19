import { useCallback, useEffect, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../../components/svgs";
import useDraggable from "../../../../hooks/useDraggable";
import useNextId from "../../hooks/useNextId";
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

const ExpressionList = () => {
  const { expressions } = useAppSelector(
    (state) => state.graphSlice.currentGraph
  );
  const dispatch = useAppDispatch();
  const [nextId, setNextId] = useNextId(expressions);
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
      setNextId(nextId + 1);
    }
  }, [expressions]);

  return (
    <div className="expression-list">
      <ol ref={draggableContainerRef}>
        {expressions.length > 0 &&
          expressions.map((item, index) => {
            return (
              <li
                key={item.id}
                className="expression-list__li draggable"
                expr-id={item.id}
                item-idx={index}
              >
                <ExpressionDynamicIsland
                  dispatch={dispatch}
                  item={item}
                  index={index + 1}
                />

                <ResizableTextarea
                  container={{
                    className: "font-medium",
                    style: {
                      color: CSS_VARIABLES.onSurfaceBodyHigh,
                      paddingRight: "3.5rem",
                      paddingLeft: "1rem",
                    },
                  }}
                  textarea={{
                    autoFocus: index === expressions.length - 1 ? true : false,
                    value: item.content,
                    onChange: (e) => {
                      dispatch(
                        updateExpressionContent({
                          id: item.id,
                          content: e.target.value,
                          idx: index,
                        })
                      );
                    },
                  }}
                />

                <ButtonTarget
                  onClick={(e) => {
                    e.currentTarget.disabled = true;
                    e.currentTarget.parentElement!.animate(
                      AnimateScale(),
                      animationOptions.current
                    );
                    setTimeout(() => {
                      dispatch(deleteExpression({ id: item.id, idx: index }));
                    }, CSS_VARIABLES.animationSpeedFast);
                  }}
                  title={`Delete ${item.type} ${index + 1}`}
                  className="button--hovered"
                  style={{ position: "absolute", top: "0.5rem", right: "0" }}
                >
                  <Close />
                </ButtonTarget>
              </li>
            );
          })}
        {!isDragging && (
          <li
            role="button"
            onClick={() => {
              dispatch(
                createExpression({ id: nextId, type: "expression", loc: "end" })
              );
              setNextId(nextId + 1);
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
