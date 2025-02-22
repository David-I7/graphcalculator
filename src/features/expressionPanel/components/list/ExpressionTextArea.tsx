import React, { useState } from "react";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { Expression, ExpressionType } from "../../../../lib/api/graph";
import { useAppDispatch } from "../../../../state/hooks";
import { updateExpressionContent } from "../../../../state/graph/graph";
import ResizableTextarea from "../../../../components/input/ResizableTextarea";

type ExpressionTextAreaProps<T extends ExpressionType = ExpressionType> = {
  autoFocus: boolean;
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
  autoFocus,
  item,
  dispatch,
  idx,
}: ExpressionTextAreaProps<"expression">) => {
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
        autoFocus: autoFocus,
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
const NoteTextArea = ({
  autoFocus,
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
        autoFocus: autoFocus,
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
