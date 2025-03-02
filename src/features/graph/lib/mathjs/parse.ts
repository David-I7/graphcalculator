import {
  AssignmentNode,
  derivative,
  FunctionAssignmentNode,
  MathNode,
  ParenthesisNode,
} from "mathjs";
import { FnState } from "../graph/commands";

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
    const scope = Object.create(globalScope);
    code.evaluate(scope);

    //y or x intercept
    const inputIntercept = node.expr.evaluate({ [node.params[0]]: 0 });

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
      const scope = Object.create(globalScope);
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
};

export const { functionParser } = parsers;
