import { useRef, useState } from "react";
import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../components/svgs";
import useDraggable from "../../../hooks/useDraggable";

type ExpressionListData = {
  type: "note" | "expression" | "table" | null;
  payload: string;
  id: string;
};

const mockData: ExpressionListData[] = [
  { type: "expression", payload: "f(x) = 3x", id: crypto.randomUUID() },
  { type: "expression", payload: "g(x) = x", id: crypto.randomUUID() },
];

const ExpressionList = () => {
  const [state, setState] = useState<ExpressionListData[]>(mockData);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const draggedId = useRef<string | null>(null);
  const draggableContainerRef = useRef<HTMLOListElement>(null);

  function setup(currentTarget: HTMLOListElement) {
    draggedId.current = currentTarget.getAttribute("expr-id");
    if (!draggedId.current) return;
    setIsDragging(true);
  }

  function cleanup(currentTarget: HTMLOListElement) {
    const id = draggedId.current;
    if (!id) return;

    let i: number = 0;
    let found: boolean = false;
    for (i; i < currentTarget.parentElement!.children.length; ++i) {
      if (
        currentTarget.parentElement!.children[i].getAttribute("expr-id") === id
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

  return (
    <div className="expression-list">
      <ol ref={draggableContainerRef}>
        {state.map((item, index) => {
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

              <textarea
                autoFocus={index === state.length - 1 ? true : false}
                defaultValue={item.payload}
              ></textarea>

              <ButtonTarget
                onClick={() => {
                  setState(
                    state.filter((filterdItem) => filterdItem.id !== item.id)
                  );
                }}
                title={`Delete ${item.type}`}
                className="button--hovered"
              >
                <Close width={24} height={24} />
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
                  type: null,
                  payload: "",
                  id: crypto.randomUUID(),
                },
              ]);
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
