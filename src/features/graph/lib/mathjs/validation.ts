import {
  AssignmentNode,
  ConstantNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  ObjectNode,
  OperatorNode,
  ParenthesisNode,
  parse,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import {
  GlobalMathConstants,
  GlobalMathFunctions,
  restrictedVariables,
} from "../../data/math";
import { Expression, Scope } from "../../../../state/graph/types";
import { isInScope } from "../../../../state/graph/controllers";

const ErrorCause = {
  invalid_function_declaration: 0,
  lack_of_equation_notation: 1,
  unknown: 3,
  syntax: 4,
  unsupported_feature: 5,
  invalid_variable_declaration: 6,
};

const isPointRegex = /\(([^,)]+\)?),(.*)\)/;

export type SyntaxValidationResult =
  | {
      err: ApplicationError;
      node: undefined;
    }
  | {
      err: undefined;
      node: MathNode;
    };

export type ValidationContext = {
  variable: string;
  scope: Scope;
};

export type ExpressionValidationResult = ApplicationError | MathNode;

export class ExpressionValidator {
  constructor() {}

  validateRecursive(
    expr: string,
    data: Expression,
    scope: Scope
  ): ExpressionValidationResult {
    const { err, node } = this.validateSyntax(expr);
    if (err) return err;

    const ctx = this.initializeContext(node, data, scope);
    if ("code" in ctx) return ctx;

    try {
      node.traverse((node, path, parent) => {
        const res = this.validateNode(node, parent, scope);
        if ("code" in res) throw res;
      });
    } catch (err) {
      return err as ApplicationError;
    }

    return node;
  }

  initializeContext(
    node: MathNode,
    data: Expression,
    scope: Scope
  ): ValidationContext | ApplicationError {
    if (node instanceof FunctionAssignmentNode) {
      if (isInScope(node.name, data, scope)) {
        return this.makeExpressionError(
          `
              You've defined '${node.name}' in more than one place. Try deleting some of the definitions of '${node.name}'.
              `,
          "invalid_variable_declaration"
        );
      }

      if (node.params.length) {
        return {
          scope,
          variable: node.params[0],
        };
      }
    } else if (node instanceof AssignmentNode) {
      const variable = node.object.name;

      if (variable === "f" || GlobalMathConstants.has(variable))
        return this.makeExpressionError(
          `'${variable}' is a restricted symbol. Try using a different one instead.`,
          "invalid_variable_declaration"
        );
      else {
        if (isInScope(variable, data, scope)) {
          return this.makeExpressionError(
            `
                You've defined '${variable}' in more than one place. Try deleting some of the definitions of '${variable}'.
                `,
            "invalid_variable_declaration"
          );
        }
      }

      return {
        scope,
        variable,
      };
    }

    return {
      scope,
      variable: "",
    };
  }

  validateNode(
    node: MathNode,
    parent: MathNode | undefined,
    ctx: ValidationContext
  ) {
    if (node instanceof ConstantNode) {
      return this.validateConstantNode(node, parent);
    } else if (node instanceof SymbolNode) {
      return this.validateSymbolNode(node, parent, scope);
    } else if (node instanceof OperatorNode) {
      return this.validateOperatorNode(node as unknown as OperatorNode, parent);
    } else if (node instanceof FunctionNode) {
      return this.validateFunctionNode(node, parent, scope);
    } else if (node instanceof FunctionAssignmentNode) {
      return this.validateFunctionAssignmentNode(node, parent);
    } else if (node instanceof ParenthesisNode) {
      return this.validateParenthesisNode(node, parent);
    }
    return node;
  }

  validateSyntax(expr: string): SyntaxValidationResult {
    let node: MathNode;
    try {
      node = parse(expr);

      return { err: undefined, node };
    } catch (err) {
      if (err instanceof SyntaxError) {
        let pos: string = "";
        let itr = err.message.length - 2;
        while (Number.isInteger(parseFloat(err.message[itr]))) {
          pos = err.message[itr] + pos;
          itr--;
        }

        const index = Number(pos) - 1;
        const cause = expr[index] || expr[index - 1];

        if (
          cause === "=" ||
          cause === "+" ||
          cause === "-" ||
          cause === "*" ||
          cause === "/"
        ) {
          return this.makeSyntaxError(
            `You need something on both sides of the '${cause}' symbol.`,
            "syntax"
          );
        } else if (cause === "(") {
          return this.makeSyntaxError(
            `Parenthesis must contain something inside.`,
            "syntax"
          );
        } else if (err.message.startsWith("Parenthesis") || cause === ",") {
          const match = expr.match(isPointRegex);
          if (match) {
            if (!match[2].length) {
              return this.makeSyntaxError(
                `You need something on both sides of the '${cause}' symbol.`,
                "syntax"
              );
            } else if (match[2].includes(",")) {
              return this.makeSyntaxError(
                `We only support 2D points.`,
                "unsupported_feature"
              );
            } else if (match.index && match.index > 0) {
              return this.makeSyntaxError(
                `I don't know what to do with this.`,
                "unsupported_feature"
              );
            } else {
              const x = this.validateSyntax(match[1]);
              if (x.err) return x;
              const y = this.validateSyntax(match[2]);
              if (y.err) return y;

              return {
                node: new ObjectNode({
                  x: x.node,
                  y: y.node,
                }),
                err: undefined,
              };
            }
          }

          if (cause === ",") {
            return this.makeSyntaxError(
              `You need something on both sides of the '${cause}' symbol.`,
              "syntax"
            );
          }

          return this.makeSyntaxError(`Try closing the parenthesis.`, "syntax");
        } else if (err.message.startsWith("Value expected")) {
          if (cause === ")") {
            return this.makeSyntaxError(
              `Parenthesis must contain something inside.`,
              "syntax"
            );
          }
        }
      }

      return this.makeSyntaxError(``, "syntax");
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

    return node;
  }

  validateSymbolNode(
    node: SymbolNode,
    parent: MathNode | undefined,
    scope: Scope
  ): ExpressionValidationResult {
    // assumption is that parent is already valid.

    // symbol
    if (!parent) {
      return this.makeExpressionError(
        `Try adding '${
          node.name[0] === "y" ? "x" : "y"
        }=' to the beginning of the equation.`,
        "lack_of_equation_notation"
      );
    }

    if (parent instanceof AssignmentNode && parent.object === node) return node;

    if (parent instanceof FunctionNode && parent.fn === node) {
      if (node.name in scope && typeof scope[node.name] === "number")
        return this.makeExpressionError(
          `'${node.name}' is not a function. Try removing the parenthesis.`,
          "invalid_variable_declaration"
        );

      return node;
    }

    // f(x) = symbol
    if (!(node.name in scope)) {
      if (
        parent instanceof AssignmentNode &&
        node.name === parent.object.name
      ) {
        return this.makeExpressionError(
          `We only support implicit functions of x and y.`,
          "unsupported_feature"
        );
      }

      if (restrictedVariables.has(node.name)) {
        return this.makeExpressionError(
          `'${node.name}' is a restricted symbol. Try using a different one instead.`,
          "invalid_variable_declaration"
        );
      }

      return this.makeExpressionError(
        `Too many variables, try defining '${node.name}'.`,
        "invalid_variable_declaration"
      );
    } else {
      if (typeof scope[node.name] === "string") {
        return this.makeExpressionError(
          `'${node.name}' is a function. Try using parenthesis.`,
          "invalid_variable_declaration"
        );
      }
    }

    return node;
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
          "invalid_function_declaration"
        );
      } else if (node.args[1] instanceof SymbolNode) {
        return this.makeExpressionError(
          `Try adding '${
            node.args[1].name === "y" ? "x" : "y"
          }=' to the beginning of the equation.`,
          "invalid_function_declaration"
        );
      }
    }

    return node;
  }

  validateFunctionNode(
    node: FunctionNode,
    parent: MathNode | undefined,
    scope: Scope
  ): ExpressionValidationResult {
    const requiredArgs = 1;

    if (node.fn instanceof SymbolNode) {
      if (node.fn.name.length === 1) {
        if (!(node.fn.name in scope))
          return this.makeExpressionError(
            `Function ${node.fn.name} is not defined.`,
            "invalid_variable_declaration"
          );
      }

      if (node.args.length > requiredArgs) {
        return this.makeExpressionError(
          `We only support functions with 1 argument.`,
          "invalid_function_declaration"
        );
      } else if (node.args.length < requiredArgs)
        return this.makeExpressionError(
          `Function '${node.fn.name}' requires an argument. For example, try typing: '${node.fn.name}(x)'.`,
          "invalid_function_declaration"
        );
      // else if (!(node.args[0] instanceof SymbolNode))
      //   return this.makeExpressionError(
      //     "Calling functions is not supported yet.",
      //     "unsupported_feature"
      //   );
    }

    if (!parent) {
      // valid Function node, just not assigned any value

      if (!(node.args[0] instanceof SymbolNode)) {
        return this.makeExpressionError(
          "Calling functions is not supported yet.",
          "unsupported_feature"
        );
      }

      const param = (node.args[0] as SymbolNode).name;
      return this.makeExpressionError(
        GlobalMathFunctions.has(node.fn.name)
          ? `Try adding '${
              (node.args[0] as SymbolNode).name === "y" ? "x" : "y"
            }=' to the beginning of the equation.`
          : `Try assigning a value to ${node.fn.name}(${
              param ? param : "x"
            }). For example try ${node.fn.name}(${param ? param : "x"}) = ${
              param ? param : "x"
            }.`,
        "invalid_function_declaration"
      );
    }

    return node;
  }

  validateFunctionAssignmentNode(
    node: FunctionAssignmentNode,
    parent: MathNode | undefined
  ): ExpressionValidationResult {
    const requiredArgs = 1;

    if (node.params.length > requiredArgs)
      return this.makeExpressionError(
        `We only support functions with 1 argument.`,
        "invalid_function_declaration"
      );
    else if (node.params.length < requiredArgs) {
      return this.makeExpressionError(
        GlobalMathFunctions.has(node.name)
          ? `Function '${node.name}' requires an argument. For example, try typing: '${node.name}(x)'.`
          : `Function '${node.name}' is not defined.`,
        "invalid_function_declaration"
      );
    }

    return node;
  }

  validateParenthesisNode(node: ParenthesisNode, parent: undefined | MathNode) {
    if (!parent) {
      return this.makeExpressionError(
        `Try adding 'y=' to the beginning of the equation.`,
        "invalid_function_declaration"
      );
    }
    return node;
  }

  makeExpressionError<T extends keyof typeof ErrorCause>(
    message: string,
    type: T
  ) {
    return {
      type,
      message,
      code: ErrorCause[type],
    };
  }

  makeSyntaxError<T extends keyof typeof ErrorCause>(
    message: string,
    type: T
  ): SyntaxValidationResult {
    return {
      err: this.makeExpressionError(message, type),
      node: undefined,
    };
  }
}

export default new ExpressionValidator();
