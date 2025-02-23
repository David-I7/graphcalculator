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
import { ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import { clearError, setError } from "../../../../state/error/error";
import { DrawFunctionCommand } from "../graph/commands";

type FunctionDeclaration = Record<string, (input: number) => number>;

const useMathJs = (expr: Expression<"expression">) => {
  const graph = useGraphContext();
  const exprValidator = useRef(new MathJsParser());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!graph || !expr.data.content) return;
    let command: DrawFunctionCommand | undefined;

    const res = exprValidator.current.parse(expr, graph);

    if (!(res instanceof DrawFunctionCommand)) {
      dispatch(setError({ id: expr.id, error: res }));
    } else {
      dispatch(clearError(expr.id));

      command = res;
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
  constructor() {}

  parse(expr: Expression<"expression">, graph: Graph) {
    const { node, err } = this.validator.validate(expr.data.content);

    if (err) {
      return err;
    }

    console.log(node);
    if (node instanceof FunctionAssignmentNode) {
      const fnData = {
        fn: this.createFunctionData(node),
        derivative: this.createDerivativeData(node),
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

        const fnData = {
          fn: this.createFunctionData(fn),
          derivative: this.createDerivativeData(fn),
        };

        return new DrawFunctionCommand(graph, expr, fnData);
      }
    }

    return this.validator.makeDebugError(
      `Edge case not defined. \nDebug:\n${node}`
    ).err;
  }

  createFunctionData(node: FunctionAssignmentNode) {
    const code = node.compile();
    const scope: FunctionDeclaration = {};
    code.evaluate(scope);

    //y or x intercept
    const paramIntercept = node.expr.evaluate({ [node.params[0]]: 0 });

    return { param: node.params[0], f: scope[node.name], paramIntercept };
  }

  createDerivativeData(node: FunctionAssignmentNode) {
    const derivativeNode = derivative(node, node.params["0"], {
      simplify: false,
    });
    const derivativeFunctionAssignmentNode = new FunctionAssignmentNode(
      "f",
      node.params,
      derivativeNode
    );

    const code = node.compile();
    const scope: FunctionDeclaration = {};
    code.evaluate(scope);

    return {
      param: derivativeFunctionAssignmentNode.params[0],
      f: scope[derivativeFunctionAssignmentNode.name],
    };
  }
}
