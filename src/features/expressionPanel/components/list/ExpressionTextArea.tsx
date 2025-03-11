import { useCallback, useRef } from "react";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useAppDispatch } from "../../../../state/hooks";
import {
  resetFocusedItem,
  setFocusedItem,
  updateItemContent,
} from "../../../../state/graph/graph";
import ResizableTextarea from "../../../../components/input/ResizableTextarea";
import { useClickOutside, useFocus } from "../../../../hooks/dom";
import { Item, ItemType } from "../../../../state/graph/types";
import { ApplicationError } from "../../../../state/error/error";

type ExpressionTextAreaProps<T extends ItemType = ItemType> = {
  focused: boolean;
  item: Item<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  idx: number;
  error: ApplicationError | null;
};

const handleFocus = (id: number) => {
  const listItem = document.querySelector(`[expr-id="${id}"]`) as HTMLLIElement;
  listItem.classList.add("expression-list__li--focused");
};

const handleBlur = (id: number) => {
  const listItem = document.querySelector(`[expr-id="${id}"]`) as HTMLLIElement;
  listItem.classList.remove("expression-list__li--focused");
};

const ExpressionTextArea = (props: ExpressionTextAreaProps) => {
  switch (props.item.type) {
    case "expression":
      return (
        <FunctionTextArea
          {...(props as ExpressionTextAreaProps<"expression">)}
        />
      );
    case "note":
      return <NoteTextArea {...(props as ExpressionTextAreaProps<"note">)} />;
  }
};

export default ExpressionTextArea;

const FunctionTextArea = ({
  focused,
  item,
  dispatch,
  idx,
  error,
}: ExpressionTextAreaProps<"expression">) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const onFocus = useCallback(() => handleFocus(item.id), [item.id]);
  const onBlur = useCallback(() => handleBlur(item.id), [item.id]);

  useFocus(focused, ref, onFocus, onBlur);

  return (
    <div
      style={{
        display: "grid",
      }}
    >
      <ResizableTextarea
        ref={ref}
        container={{
          className: "font-medium",
          style: {
            color: CSS_VARIABLES.onSurfaceBodyHigh,
            paddingRight: "3.5rem",
            paddingLeft: "1rem",
          },
        }}
        textarea={{
          autoFocus: focused,
          value: item.data.content,
          onFocus: () => {
            if (!focused) {
              dispatch(setFocusedItem(item.id));
            }
          },
          onChange: (e) => {
            dispatch(
              updateItemContent({
                id: item.id,
                content: e.target.value,
                idx: idx,
              })
            );
          },
        }}
      />
      {item.data.type === "variable" && !error && (
        <div
          style={{
            height: "2.5rem",
            padding: "0.5rem",
            placeSelf: "flex-end",
            fontSize: "1.5rem",
          }}
        >
          = {item.data.parsedContent!.value}
        </div>
      )}
    </div>
  );
};
const NoteTextArea = ({
  focused,
  item,
  dispatch,
  idx,
}: ExpressionTextAreaProps<"note">) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const onFocus = useCallback(() => {
    handleFocus(item.id);
  }, [item.id]);
  const onBlur = useCallback(() => {
    dispatch(resetFocusedItem(item.id));
    handleBlur(item.id);
  }, [item.id]);
  const elementSelector = useCallback(
    () => document.querySelector(".expression-panel") as HTMLDivElement,
    []
  );

  useClickOutside(focused, elementSelector, onBlur);
  useFocus(focused, ref, onFocus, onBlur);

  return (
    <ResizableTextarea
      ref={ref}
      container={{
        className: "font-medium",
        style: {
          fontSize: "1rem",
          color: CSS_VARIABLES.onSurfaceBodyHigh,
          paddingRight: "3.5rem",
          paddingLeft: "1rem",
        },
      }}
      textarea={{
        onFocus: () => {
          dispatch(setFocusedItem(item.id));
        },
        autoFocus: focused,
        value: item.data.content,
        onChange: (e) => {
          dispatch(
            updateItemContent({
              id: item.id,
              content: e.target.value,
              idx: idx,
            })
          );
        },
      }}
    />
  );
};
