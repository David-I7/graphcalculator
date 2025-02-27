import { useEffect, useRef } from "react";
import { Expression } from "../../../../lib/api/graph";
import {
  AssignmentNode,
  compile,
  derivative,
  evaluate,
  FunctionAssignmentNode,
  MathNode,
  simplify,
  SymbolNode,
} from "mathjs";
import { Graph } from "../graph/graph";
import { useGraphContext } from "../../Graph";
import { ExpressionValidationResult, ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import {
  ApplicationError,
  clearError,
  setError,
} from "../../../../state/error/error";
import { DrawFunctionCommand, FnData } from "../graph/commands";
import { ExpressionTransformer } from "./transformer";

type FunctionDeclaration = Record<string, (input: number) => number>;

const useMathJs = (expr: Expression<"expression">) => {
  const graph = useGraphContext();
  const exprParser = useRef(new MathJsParser());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!graph || !expr.data.content) return;
    let command: DrawFunctionCommand | undefined;

    const { err, node } = exprParser.current.transform(expr.data.content);

    let parsedCommand!: DrawFunctionCommand | ApplicationError;
    if (node) {
      parsedCommand = exprParser.current.parse(node!, expr, graph);
    }

    if (err) {
      dispatch(setError({ id: expr.id, error: err }));
    } else if (!(parsedCommand instanceof DrawFunctionCommand)) {
      dispatch(setError({ id: expr.id, error: parsedCommand }));
    } else {
      dispatch(clearError(expr.id));
      command = parsedCommand;
      graph.addCommand(command);
    }

    return () => {
      if (command) {
        graph.removeCommand(command);
        command.destroy();
      }
    };
  }, [expr, graph]);
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
    expr: Expression<"expression">,
    graph: Graph
  ): ApplicationError | DrawFunctionCommand {
    if (node instanceof FunctionAssignmentNode) {
      const df = this.createDerivativeData(node);

      const fnData: FnData = {
        f: this.createFunctionData(node),
        df: this.createDerivativeData(node),
        ddf: this.createDerivativeData(df.node),
      };

      return new DrawFunctionCommand(graph, expr, fnData);
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

        return new DrawFunctionCommand(graph, expr, fnData);
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
      inputIntercept,
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
