import {
  AssignmentNode,
  derivative,
  FunctionAssignmentNode,
  MathNode,
  ObjectNode,
} from "mathjs";
import { FnState } from "../graph/commands";
import { Expression, Scope } from "../../../../state/graph/types";

export class FunctionExpressionParser {
  constructor() {}

  parse(node: MathNode, globalScope: Scope): FnState {
    if (node instanceof FunctionAssignmentNode) {
      let df = this.createDerivativeData(node, globalScope);

      const fnData: FnState = {
        f: this.createFunctionData(node, globalScope),
        df: this.createDerivativeData(node, globalScope),
        ddf: df.node ? this.createDerivativeData(df.node, globalScope) : df,
      };

      return fnData;
    }

    throw new Error(
      `Node is not instance of FunctionAsignemntNode\n\n ${node}`
    );
  }

  createFunctionData(
    node: FunctionAssignmentNode,
    globalScope: Scope
  ): FnState["f"] {
    const code = node.compile();
    const scope = { ...globalScope };
    code.evaluate(scope);

    //y or x intercept
    const inputIntercept = node.expr.evaluate({
      ...scope,
      [node.params[0]]: 0,
    });

    return {
      param: node.params[0],
      f: scope[node.name] as (input: number) => number,
      inputIntercept: Number.isFinite(inputIntercept)
        ? inputIntercept
        : undefined,
      outputIntercepts: [],
      node,
    };
  }

  createDerivativeData(
    node: FunctionAssignmentNode,
    globalScope: Scope
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
      const scope = { ...globalScope };
      code.evaluate(scope);

      return {
        node: derivativeFunctionAssignmentNode,
        param: derivativeFunctionAssignmentNode.params[0],
        f: scope[derivativeFunctionAssignmentNode.name] as (
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

export class VariableExpressionParser {
  constructor() {}

  parse(
    node: AssignmentNode,
    globalScope: Scope
  ): NonNullable<Expression<"variable">["parsedContent"]> {
    const code = node.compile();
    const scope = { ...globalScope };
    return {
      value: code.evaluate(scope) as number,
      name: node.object.name,
    };
  }
}

export class PointExpressionParser {
  constructor() {}

  parse(
    node: ObjectNode<{
      x: MathNode;
      y: MathNode;
    }>,
    globalScope: Scope
  ): NonNullable<Expression<"point">["parsedContent"]> {
    const scope = { ...globalScope };
    const x = node.properties.x.compile().evaluate(scope);
    const y = node.properties.y.compile().evaluate(scope);

    return {
      x,
      y,
    };
  }
}

const parsers = {
  functionParser: new FunctionExpressionParser(),
  variableParser: new VariableExpressionParser(),
  pointParser: new PointExpressionParser(),
};

export const { functionParser, variableParser, pointParser } = parsers;
