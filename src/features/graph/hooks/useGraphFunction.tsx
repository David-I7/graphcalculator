import { useEffect, useMemo, useRef } from "react";
import {
  CommandState,
  DrawFunctionCommand,
  FnState,
} from "../lib/graph/commands";
import { resetFocusedItem, setFocusedItem } from "../../../state/graph/graph";
import { useAppDispatch } from "../../../state/hooks";
import { derivative, FunctionAssignmentNode, parse } from "mathjs";
import { useGraphContext } from "../Graph";
import { useGraphExprProps } from "../components/GraphExpression";
import { InternalScope, Scope } from "../../../state/graph/types";
import { createDependencies } from "../lib/mathjs/utils";

function useGraphFunction({
  id,
  data,
  focused,
  scope,
}: useGraphExprProps<"function">) {
  const graph = useGraphContext();
  const node = useMemo(() => {
    return data.parsedContent
      ? (parse(data.parsedContent.node) as FunctionAssignmentNode)
      : undefined;
  }, [data.parsedContent, scope]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  console.log(node);
  useEffect(() => {
    if (!node || !graph) return;

    let fnData!: FnState;

    try {
      fnData = FunctionCommandStateFactory.createState(node, scope);
    } catch (err) {
      // synchronization err
      // console.log(err);
      return;
    }

    const stateSync: CommandState = {
      status: focused ? "focused" : "idle",
      onStateChange(prev, cur) {
        if (prev === cur) return;

        if (cur === "idle") {
          dispatch(resetFocusedItem(id));
        } else {
          dispatch(setFocusedItem(id));
        }
      },
    };

    const currentCommand = new DrawFunctionCommand(
      graph,
      fnData,
      data.settings,
      stateSync
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [node, graph]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.commandState.status === "idle" && focused) {
      command.current.setStatus("focused");
    } else if (command.current.commandState.status === "focused" && !focused) {
      command.current.setStatus("idle");
    }
  }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);
}

export const GraphFunction = ({
  data,
  id,
  focused,
  scope,
}: useGraphExprProps<"function">) => {
  useGraphFunction({ id, focused, data, scope });

  return null;
};

export class FunctionCommandStateFactory {
  constructor() {}

  static createState(
    node: FunctionAssignmentNode,
    globalScope: Scope
  ): FnState {
    const { scope } = createDependencies(node, globalScope);

    const df = this.createDerivativeData(node, scope);

    const fnData: FnState = {
      f: this.createFunctionData(node, scope),
      df: this.createDerivativeData(node, scope),
      ddf: df.node ? this.createDerivativeData(df.node, scope) : df,
    };

    return fnData;
  }

  private static createFunctionData(
    node: FunctionAssignmentNode,
    scope: InternalScope
  ): FnState["f"] {
    const code = node.compile();
    const copy = { ...scope };
    code.evaluate(copy);

    //y or x intercept
    const inputIntercept = node.expr.evaluate({
      ...copy,
      [node.params[0]]: 0,
    });

    return {
      param: node.params[0],
      f: copy[node.name] as (input: number) => number,
      inputIntercept: Number.isFinite(inputIntercept)
        ? inputIntercept
        : undefined,
      outputIntercepts: [],
      node,
    };
  }

  private static createDerivativeData(
    node: FunctionAssignmentNode,
    scope: InternalScope
  ): FnState["df"] {
    try {
      const derivativeNode = derivative(node, node.params["0"], {
        simplify: false,
      });
      const derivativeFunctionAssignmentNode = new FunctionAssignmentNode(
        "f",
        node.params,
        derivativeNode
      );

      const code = derivativeFunctionAssignmentNode.compile();
      const copy = { ...scope };
      code.evaluate(copy);

      return {
        node: derivativeFunctionAssignmentNode,
        param: derivativeFunctionAssignmentNode.params[0],
        f: copy[derivativeFunctionAssignmentNode.name] as (
          input: number
        ) => number,
        criticalPoints: [],
      };
    } catch (err) {
      // derivative can be undefined if function is not continuous
      return { node: undefined };
    }
  }
}
