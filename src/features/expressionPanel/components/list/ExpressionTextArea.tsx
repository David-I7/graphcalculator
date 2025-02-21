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

const ExpressionTextArea = ({
  autoFocus,
  item,
  dispatch,
  idx,
}: ExpressionTextAreaProps) => {
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

export default ExpressionTextArea;

//    try {
//   const node = parse(expr.data.content);
//   // console.log(node.toTex());
//   const code = node.compile();
//   const scope: Scope = {};
//   code.evaluate(scope);
//   command = new DrawFunctionCommand(graph, expr, Object.values(scope)[0]);
//   graph.addCommand(command);
//   // console.log(command, graph);
// } catch (err) {
//   console.log(err);
//}
