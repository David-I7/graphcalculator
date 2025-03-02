import {
  AssignmentNode,
  derivative,
  FunctionAssignmentNode,
  MathNode,
  ParenthesisNode,
} from "mathjs";
import { FnState } from "../graph/commands";
import { ClientExpressionData } from "../../../../state/graph/types";

type FunctionDeclaration = {
  [index: string]: ((input: number) => number) | number;
};

export class FunctionExpressionParser {
  constructor() {}

  parse(
    node: MathNode,
    globalScope: Record<string, number>
  ): undefined | FnState {
    if (node instanceof FunctionAssignmentNode) {
      let df = this.createDerivativeData(node, globalScope);

      const fnData: FnState = {
        f: this.createFunctionData(node, globalScope),
        df: this.createDerivativeData(node, globalScope),
        ddf: df.node ? this.createDerivativeData(df.node, globalScope) : df,
      };

      return fnData;
    }

    return;
  }

  createFunctionData(
    node: FunctionAssignmentNode,
    globalScope: FunctionDeclaration
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
    globalScope: FunctionDeclaration
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
    globalScope: FunctionDeclaration
  ): NonNullable<ClientExpressionData["variable"]["clientState"]> {
    const code = node.compile();
    const scope = { ...globalScope };
    return {
      value: code.evaluate(scope) as number,
      name: node.object.name,
    };
  }
}

// else if (node instanceof AssignmentNode) {
//   const variable = node.object.name;

//   // implicit function
//   if (variable === "y" || variable === "x") {
//     const fn = new FunctionAssignmentNode(
//       "f",
//       [variable === "x" ? "y" : "x"],
//       node.value
//     );

//     const df = this.createDerivativeData(fn, globalScope);

//     const fnData: FnState = {
//       f: this.createFunctionData(fn, globalScope),
//       df,
//       ddf: df.node ? this.createDerivativeData(df.node, globalScope) : df,
//     };

//     return fnData;
//   } else {
//     // variable Assignment
//   }
// } else if (node instanceof ParenthesisNode) {
// }

const parsers = {
  functionParser: new FunctionExpressionParser(),
  variableParser: new VariableExpressionParser(),
};

export const { functionParser, variableParser } = parsers;
