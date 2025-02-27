import React, { useRef, useState } from "react";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { Expression, ExpressionType } from "../../../../lib/api/graph";
import { useAppDispatch } from "../../../../state/hooks";
import {
  setFocusedExpression,
  updateExpressionContent,
} from "../../../../state/graph/graph";
import ResizableTextarea from "../../../../components/input/ResizableTextarea";
import { useFocus } from "../../../../hooks/dom";

type ExpressionTextAreaProps<T extends ExpressionType = ExpressionType> = {
  focused: boolean;
  item: Expression<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  idx: number;
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
}: ExpressionTextAreaProps<"expression">) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    const listItem = document.querySelector(
      `[expr-id="${item.id}"]`
    ) as HTMLLIElement;
    listItem.classList.add("expression-list__li--focused");
  };

  const handleBlur = () => {
    const listItem = document.querySelector(
      `[expr-id="${item.id}"]`
    ) as HTMLLIElement;
    listItem.classList.remove("expression-list__li--focused");
  };

  useFocus(focused, ref, handleFocus, handleBlur);

  return (
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
            dispatch(setFocusedExpression(item.id));
          }
        },
        onChange: (e) => {
          dispatch(
            updateExpressionContent({
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
const NoteTextArea = ({
  focused,
  item,
  dispatch,
  idx,
}: ExpressionTextAreaProps<"note">) => {
  return (
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
        autoFocus: focused,
        value: item.data.content,
        onChange: (e) => {
          dispatch(
            updateExpressionContent({
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
