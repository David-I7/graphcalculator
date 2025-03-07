import {
  AssignmentNode,
  FunctionAssignmentNode,
  MathNode,
  ObjectNode,
} from "mathjs";

import { Expression, Scope } from "../../../../state/graph/types";
import { createDependencies, getAllSymbols } from "./utils";

export class FunctionExpressionParser {
  constructor() {}

  parse(
    node: FunctionAssignmentNode,
    globalScope: Scope
  ): NonNullable<Expression<"function">["parsedContent"]> {
    const scopeDeps = [...getAllSymbols(node)];

    return {
      name: node.name,
      node: node.toString(),
      scopeDeps,
    };
  }
}

export class VariableExpressionParser {
  constructor() {}

  parse(
    node: AssignmentNode,
    globalScope: Scope
  ): NonNullable<Expression<"variable">["parsedContent"]> {
    const { scope, scopeDeps } = createDependencies(node, globalScope);

    const code = node.compile();
    const res = {
      value: code.evaluate(scope) as number,
      name: node.object.name,
      node: node.toString(),
      scopeDeps,
    };
    return res;
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
    const { scope, scopeDeps } = createDependencies(node, globalScope);
    const x = node.properties.x.compile().evaluate(scope);
    const y = node.properties.y.compile().evaluate(scope);

    const res = {
      x,
      y,
      node: node.toString(),
      scopeDeps,
    };
    return res;
  }
}

const parsers = {
  functionParser: new FunctionExpressionParser(),
  variableParser: new VariableExpressionParser(),
  pointParser: new PointExpressionParser(),
};

export const { functionParser, variableParser, pointParser } = parsers;
