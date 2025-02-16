import { useEffect, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../../components/svgs";
import useDraggable from "../../../../hooks/useDraggable";
import ExpressionTextarea from "../appbar/ExpressionTextarea";
import useNextId from "../../hooks/useNextId";

type ExpressionListData = {
  type: "note" | "expression" | "table" | null;
  payload: string;
  id: number;
};

const ExpressionList = () => {
  const [state, setState] = useState<ExpressionListData[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const draggedId = useRef<number>(0);
  const draggableContainerRef = useRef<HTMLOListElement>(null);

  function setup(currentTarget: HTMLOListElement) {
    draggedId.current = Number(currentTarget.getAttribute("expr-id"));

    if (!draggedId.current || isNaN(draggedId.current)) return;
    setIsDragging(true);
  }

  function cleanup(currentTarget: HTMLOListElement) {
    const id = draggedId.current;
    const strId = draggedId.current.toString();

    let i: number = 0;
    let found: boolean = false;
    for (i; i < currentTarget.parentElement!.children.length; ++i) {
      if (
        currentTarget.parentElement!.children[i].getAttribute("expr-id") ===
        strId
      ) {
        found = true;
        break;
      }
    }
    if (!found) return;

    let moved!: ExpressionListData;
    const newState = state.filter((expr) => {
      if (expr.id !== id) {
        return true;
      } else {
        moved = expr;
        return false;
      }
    });

    newState.splice(i, 0, moved);

    setState(newState);
    setIsDragging(false);
  }

  useDraggable({
    draggableContainerRef,
    sharedClassname: "draggable",
    draggingClassname: "expression-list__li--dragging",
    proxyClassname: "dynamic-island",
    setup,
    cleanup,
  });

  const [nextId, setNextId] = useNextId(state);

  useEffect(() => {
    if (state.length === 0) {
      setState([
        {
          type: "expression",
          id: nextId,
          payload: "",
        },
      ]);
      setNextId(nextId + 1);
    }
  }, [state]);

  return (
    <div className="expression-list">
      <ol ref={draggableContainerRef}>
        {state.length > 0 &&
          state.map((item, index) => {
            return (
              <li
                key={item.id}
                className="expression-list__li draggable"
                expr-id={item.id}
              >
                <div draggable className="dynamic-island">
                  <div className="dynamic-island__index">{index + 1}</div>
                  <div className="dynamic-island__type">
                    {item.type === "expression"
                      ? "f(x)"
                      : item.type === "note"
                      ? '""'
                      : undefined}
                  </div>
                </div>

                <ExpressionTextarea
                  autoFocus={index === state.length - 1 ? true : false}
                  defaultValue={item.payload}
                />

                <ButtonTarget
                  onClick={() => {
                    setState(
                      state.filter((filterdItem) => filterdItem.id !== item.id)
                    );
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
              setState([
                ...state,
                {
                  type: "expression",
                  payload: "",
                  id: nextId,
                },
              ]);
              setNextId(nextId + 1);
            }}
            className="expression-list__li--faded"
          >
            <div className="dynamic-island">
              <div className="dynamic-island__index">{state.length + 1}</div>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
};

export default ExpressionList;
