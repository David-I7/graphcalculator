import { useEffect, useRef } from "react";
import { Expression } from "../../../../lib/api/graph";
import {
  AssignmentNode,
  derivative,
  FunctionAssignmentNode,
  MathNode,
} from "mathjs";
import { Graph } from "../graph/graph";
import { useGraphContext } from "../../Graph";
import { ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import {
  ApplicationError,
  clearError,
  setError,
} from "../../../../state/error/error";
import { DrawFunctionCommand, ExprData, FnData } from "../graph/commands";
import { ExpressionTransformer } from "./transformer";
import {
  setFocusedExpression,
  resetFocusedExpression,
} from "../../../../state/graph/graph";

type FunctionDeclaration = Record<string, (input: number) => number>;

const useMathJs = (expr: Expression<"expression">, focused: boolean) => {
  const graph = useGraphContext();
  const exprParser = useRef(new MathJsParser());
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  useEffect(() => {
    if (!graph || !expr.data.content) return;

    const { err, node } = exprParser.current.transform(expr.data.content);

    let parsedCommand!: DrawFunctionCommand | ApplicationError;
    const exprState: ExprData = {
      color: expr.data.color,
      hidden: expr.data.hidden,
      state: focused ? "focused" : "idle",
      onStateChange(prev, cur) {
        if (prev === cur) return;

        if (cur === "idle") {
          dispatch(resetFocusedExpression(expr.id));
        } else {
          dispatch(setFocusedExpression(expr.id));
        }
      },
    };
    if (node) {
      parsedCommand = exprParser.current.parse(node!, graph, exprState);
    }

    if (err) {
      dispatch(setError({ id: expr.id, error: err }));
    } else if (!(parsedCommand instanceof DrawFunctionCommand)) {
      dispatch(setError({ id: expr.id, error: parsedCommand }));
    } else {
      dispatch(clearError(expr.id));
      command.current = parsedCommand;
      graph.addCommand(command.current);
    }

    return () => {
      if (parsedCommand instanceof DrawFunctionCommand) {
        graph.removeCommand(parsedCommand);
        parsedCommand.destroy();
      }
    };
  }, [expr.data.content, graph]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings.color = expr.data.color;
    command.current.settings.hidden = expr.data.hidden;
  }, [expr.data.color, expr.data.hidden]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.state === "idle" && focused) {
      command.current.setState("focused");
    } else if (command.current.state === "focused" && !focused) {
      command.current.setState("idle");
    }
  }, [focused]);
};

export default useMathJs;

class MathJsParser {
  protected validator: ExpressionValidator = new ExpressionValidator();
  protected transformer: ExpressionTransformer = new ExpressionTransformer();
  constructor() {}

  transform(expr: string): {
    err: ApplicationError | undefined;
    node: MathNode | undefined;
  } {
    return this.transformer.transform(expr);
  }

  parse(
    node: MathNode,
    graph: Graph,
    exprState: ExprData
  ): ApplicationError | DrawFunctionCommand {
    if (node instanceof FunctionAssignmentNode) {
      const df = this.createDerivativeData(node);

      const fnData: FnData = {
        f: this.createFunctionData(node),
        df: this.createDerivativeData(node),
        ddf: this.createDerivativeData(df.node),
      };

      return new DrawFunctionCommand(graph, fnData, exprState);
    } else if (node instanceof AssignmentNode) {
      const symbol = node.object.name;

      // implicit function
      if (symbol === "y" || symbol === "x") {
        const fn = new FunctionAssignmentNode(
          "f",
          [symbol === "x" ? "y" : "x"],
          node.value
        );

        const df = this.createDerivativeData(fn);

        const fnData: FnData = {
          f: this.createFunctionData(fn),
          df,
          ddf: this.createDerivativeData(df.node),
        };

        return new DrawFunctionCommand(graph, fnData, exprState);
      }
    }

    console.log(node);
    return this.validator.makeDebugError(
      `Edge case not defined at parse. \nDebug:\n${node}`
    ).err as ApplicationError;
  }

  createFunctionData(node: FunctionAssignmentNode): FnData["f"] {
    const code = node.compile();
    const scope: FunctionDeclaration = {};
    code.evaluate(scope);

    //y or x intercept
    const inputIntercept = node.expr.evaluate({ [node.params[0]]: 0 });

    return {
      param: node.params[0],
      f: scope[node.name],
      inputIntercept: Number.isFinite(inputIntercept)
        ? inputIntercept
        : undefined,
      outputIntercepts: [],
      node,
    };
  }

  createDerivativeData(node: FunctionAssignmentNode): FnData["df"] {
    // derivative can be undefined! if function is not continuous

    const derivativeNode = derivative(node, node.params["0"], {
      simplify: false,
    });
    const derivativeFunctionAssignmentNode = new FunctionAssignmentNode(
      "f",
      node.params,
      derivativeNode
    );

    const code = derivativeFunctionAssignmentNode.compile();
    const scope: FunctionDeclaration = {};
    code.evaluate(scope);

    return {
      node: derivativeFunctionAssignmentNode,
      param: derivativeFunctionAssignmentNode.params[0],
      f: scope[derivativeFunctionAssignmentNode.name],
      criticalPoints: [],
    };
  }
}
