import { useEffect, useRef } from "react";
import { Expression } from "../../../../lib/api/graph";
import { AssignmentNode, FunctionAssignmentNode } from "mathjs";
import { Graph } from "../graph/graph";
import { useGraphContext } from "../../Graph";
import { ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import { clearError, setError } from "../../../../state/error/error";
import { DrawFunctionCommand } from "../graph/commands";

type Scope = Record<string, (input: number) => number>;

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

    if (node instanceof FunctionAssignmentNode) {
      const code = node.compile();
      const scope: Scope = {};
      code.evaluate(scope);
      const derivedScope = {
        [node.params[0]]: scope[node.name],
      };
      // console.log(scope);
      return new DrawFunctionCommand(graph, expr, derivedScope);
    } else if (node instanceof AssignmentNode) {
      const symbol = node.object.name;
      // implicit function
      if (symbol === "y" || symbol === "x") {
        const fn = new FunctionAssignmentNode(
          "f",
          [symbol === "x" ? "y" : "x"],
          node.value
        );
        const code = fn.compile();
        const scope: Scope = {};
        code.evaluate(scope);
        const derivedScope = {
          [fn.params[0]]: scope.f,
        };
        return new DrawFunctionCommand(graph, expr, derivedScope);
      }
    }

    return this.validator.makeDebugError(
      `Edge case not defined. \nDebug:\n${node}`
    ).err;
  }
}
