import React, { useEffect, useState } from "react";
import { ApplicationError } from "../../../state/error/error";
import {
  removeParsedContent,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} from "../../../state/graph/graph";
import { isExpression, Item, Scope } from "../../../state/graph/types";
import ExpressionTransformer from "../lib/mathjs/transformer";
import { AssignmentNode, FunctionAssignmentNode, ObjectNode } from "mathjs";
import { pointParser, variableParser } from "../lib/mathjs/parse";
import { useAppDispatch } from "../../../state/hooks";

const useValidateExpression = ({
  idx,
  item,
  scope,
  dispatch,
}: {
  idx: number;
  item: Item;
  scope: Scope;
  dispatch: ReturnType<typeof useAppDispatch>;
}) => {
  const [error, setError] = useState<ApplicationError | null>(null);

  useEffect(() => {
    if (!isExpression(item)) return;

    if (!item.data.content.length) {
      if (error) {
        setError(null);
      }
      dispatch(
        removeParsedContent({
          id: item.id,
          idx,
          type: item.data.type,
        })
      );
      return;
    }

    const clonedScope: Set<string> = new Set();
    Object.keys(scope).forEach((key) => clonedScope.add(key));

    const res = ExpressionTransformer.transform(item.data, clonedScope);
    if (res.err) {
      dispatch(
        removeParsedContent({
          id: item.id,
          idx,
          type: item.data.type,
        })
      );
      setError(res.err);
    } else {
      console.log(res.node);
      if (res.node instanceof FunctionAssignmentNode) {
        dispatch(
          updateFunctionExpr({
            id: item.id,
            idx,
            parsedContent: {
              node: JSON.stringify(res.node),
              name: res.node.name,
              scopeDeps: [],
            },
          })
        );
      } else if (res.node instanceof AssignmentNode) {
        const parsedContent = variableParser.parse(res.node, scope);
        dispatch(
          updateVariableExpr({
            id: item.id,
            idx,
            parsedContent,
          })
        );
      } else if (res.node instanceof ObjectNode) {
        const parsedContent = pointParser.parse(res.node, scope);
        dispatch(
          updatePointExpr({
            id: item.id,
            idx,
            parsedContent,
          })
        );
      }

      if (error) {
        setError(null);
      }
    }

    //runs 2 times when something get added or removed from scope...
  }, [item.data.content, scope]);

  return error;
};

export default useValidateExpression;
