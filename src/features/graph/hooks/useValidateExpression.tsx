import { useEffect, useRef, useState } from "react";
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
import {
  functionParser,
  pointParser,
  variableParser,
} from "../lib/mathjs/parse";
import { useAppDispatch } from "../../../state/hooks";
import ExpressionValidator from "../lib/mathjs/validation";
import { dependenciesInScope } from "../../../state/graph/controllers";

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
  if (!isExpression(item)) return null;

  const [error, setError] = useState<ApplicationError | null>(null);
  const initialRender = useRef<boolean>(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (!item.data.content.length) {
      if (error) {
        setError(null);
      }
      if (item.data.parsedContent) {
        dispatch(
          removeParsedContent({
            id: item.id,
            idx,
            type: item.data.type,
          })
        );
      }
      return;
    }

    const res = ExpressionTransformer.transform(item.data, scope);

    if (res.err) {
      if (item.data.parsedContent) {
        dispatch(
          removeParsedContent({
            id: item.id,
            idx,
            type: item.data.type,
          })
        );
      }
      setError(res.err);
    } else {
      // console.log(res.node);
      if (res.node instanceof FunctionAssignmentNode) {
        const parsedContent = functionParser.parse(res.node, scope);
        dispatch(
          updateFunctionExpr({
            id: item.id,
            idx,
            parsedContent,
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
  }, [item.data.content]);

  useEffect(() => {
    if (!item.data.parsedContent) return;

    if (dependenciesInScope(item.data.parsedContent.scopeDeps, scope)) {
      if (error) {
        setError(null);
      }
      return;
    }

    const err = ExpressionValidator.validateRecursive(
      item.data.content,
      item.data,
      scope
    );
    setError(err as ApplicationError);
  }, [scope]);

  return error;
};

export default useValidateExpression;
