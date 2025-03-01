import {
  ConstantNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  OperatorNode,
  parse,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import { GlobalMathFunctions } from "../../data/math";

const ErrorCause = {
  insuficient_function_arg: 0,
  lack_of_equation_notation: 1,
  too_many_function_arg: 2,
  unknown: 3,
  too_many_variables: 4,
  diff_param_from_expr: 5,
  syntax: 6,
};

export type SyntaxValidationResult = {
  err: ApplicationError | undefined;
  node: MathNode | undefined;
};

export type ExpressionValidationResult = ApplicationError | undefined;

export class ExpressionValidator {
  constructor() {}

  validateSyntax(expr: string): SyntaxValidationResult {
    let node: MathNode;
    try {
      node = parse(expr);

      return { err: undefined, node };
    } catch (err) {
      if (err instanceof SyntaxError) {
        let idx: string = "";
        let itr = err.message.length - 2;
        while (Number.isInteger(parseFloat(err.message[itr]))) {
          idx = err.message[itr] + idx;
          itr--;
        }

        const index = Number(idx);
        const cause = expr[index - 1] || expr[index - 2];

        if (cause) {
          if (
            cause === "=" ||
            cause === "+" ||
            cause === "-" ||
            cause === "*" ||
            cause === "/" ||
            cause === ","
          ) {
            return this.makeSyntaxError(
              `You need something on both sides of the '${cause}' symbol.`,
              "syntax"
            );
          } else if (cause === "(") {
            return this.makeSyntaxError(
              expr[index - 3]
                ? `Function '${expr[index - 3]}' is not defined.`
                : `Parenthesis cannot be empty.`,
              "syntax"
            );
          } else if (cause === ")") {
            return this.makeSyntaxError(
              `Parenthesis cannot be empty.`,
              "syntax"
            );
          } else if (err.message.startsWith("Parenthesis")) {
            return this.makeSyntaxError(
              `Try closing the parenthesis.`,
              "syntax"
            );
          } else {
            console.log(cause);
            return this.makeSyntaxError(``, "syntax");
          }
        }
      }

      return this.makeDebugError(
        `Edge case not defined for syntaxError, \nDebug:\n${
          err as Error
        },\n${expr}\n
        `
      );
    }
  }

  validateConstantNode(
    node: ConstantNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    if (!parent) {
      return this.makeExpressionError(
        "Try adding 'y=' to the beginning of the equation.",
        "lack_of_equation_notation"
      );
    }

    return;
  }

  validateSymbolNode(
    node: SymbolNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    // assumption is that parent is already valid.

    if (!parent) {
      return this.makeExpressionError(
        `Try adding '${
          node.name[0] === "y" ? "x" : "y"
        }=' to the beginning of the equation.`,
        "lack_of_equation_notation"
      );
    }

    if (parent instanceof FunctionAssignmentNode) {
      if (node.name.length === 1) {
        if (parent.params[0] !== node.name) {
          return this.makeExpressionError(
            `Try including '${node.name}' as an argument by defining the function as '${parent.name}(${node.name})'.`,
            "diff_param_from_expr"
          );
        }
      }

      if (node.name.length > 1) {
        const undefinedVariable = node.name.search(`[^${parent.params[0]}]`);

        return this.makeExpressionError(
          `Too many variables, try defining '${node.name[undefinedVariable]}'.`,
          "too_many_variables"
        );
      }
    }

    return;
  }

  validateOperatorNode(
    node: OperatorNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    if (!parent) {
      if (node.args[0] instanceof SymbolNode) {
        return this.makeExpressionError(
          `Try adding '${
            node.args[0].name === "y" ? "x" : "y"
          }=' to the beginning of the equation.`,
          "lack_of_equation_notation"
        );
      } else if (node.args[1] instanceof SymbolNode) {
        return this.makeExpressionError(
          `Try adding '${
            node.args[1].name === "y" ? "x" : "y"
          }=' to the beginning of the equation.`,
          "lack_of_equation_notation"
        );
      }
    }

    return;
  }

  validateFunctionNode(
    node: FunctionNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    const requiredArgs = 1;

    if (node.fn instanceof SymbolNode) {
      if (node.args.length > requiredArgs)
        if (!GlobalMathFunctions.has(node.fn.name)) {
          return this.makeExpressionError(
            `We only support functions with 1 argument.`,
            "too_many_function_arg"
          );
        } else if (node.args.length < requiredArgs)
          return this.makeExpressionError(
            GlobalMathFunctions.has(node.fn.name)
              ? `Function '${node.fn.name}' requires an argument. For example, try typing: '${node.fn.name}(x)'.`
              : `Function '${node.fn.name}' is not defined.`,
            "insuficient_function_arg"
          );
    }

    if (!parent) {
      // valid Function node, just not assigned any value
      return this.makeExpressionError(
        GlobalMathFunctions.has(node.fn.name)
          ? `Try adding '${
              (node.args[0] as SymbolNode).name === "y" ? "x" : "y"
            }=' to the beginning of the equation.`
          : `Try assigning a value to ${node.fn.name}(${
              (node.args[0] as SymbolNode).name
            }). For example try ${node.fn.name}(${
              (node.args[0] as SymbolNode).name
            }) = ${(node.args[0] as SymbolNode).name}.`,
        "lack_of_equation_notation"
      );
    }
  }

  validateFunctionAssignmentNode(
    node: FunctionAssignmentNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    const requiredArgs = 1;

    if (node.params.length > requiredArgs)
      return this.makeExpressionError(
        `We only support functions with 1 argument.`,
        "too_many_function_arg"
      );
    else if (node.params.length < requiredArgs) {
      return this.makeExpressionError(
        GlobalMathFunctions.has(node.name)
          ? `Function '${node.name}' requires an argument. For example, try typing: '${node.name}(x)'.`
          : `Function '${node.name}' is not defined.`,
        "insuficient_function_arg"
      );
    }
  }

  protected makeExpressionError<T extends keyof typeof ErrorCause>(
    message: string,
    type: T
  ) {
    return {
      type,
      message,
      code: ErrorCause[type],
    };
  }

  protected makeSyntaxError<T extends keyof typeof ErrorCause>(
    message: string,
    type: T
  ): SyntaxValidationResult {
    return {
      err: this.makeExpressionError(message, type),
      node: undefined,
    };
  }

  makeDebugError(
    message: string
  ): SyntaxValidationResult & Required<Pick<SyntaxValidationResult, "err">> {
    return {
      err: this.makeExpressionError(message, "unknown"),
      node: undefined,
    };
  }
}

function getSymbolNodes(node: MathNode): string[] {
  const symbolSet: Set<string> = new Set();
  const symbols: string[] = [];
  node.filter((node, path, parent) => {
    if (node instanceof SymbolNode) {
      if (symbolSet.has(node.name)) return;

      if (GlobalMathFunctions.has(node.name)) {
        symbolSet.add(node.name);
        symbols.push(node.name);
        return;
      }

      for (let i = 0; i < node.name.length; i++) {
        if (symbolSet.has(node.name[i])) continue;
        symbolSet.add(node.name[i]);
        symbols.push(node.name[i]);
      }
    }
  });

  return symbols;
}

export default new ExpressionValidator();
