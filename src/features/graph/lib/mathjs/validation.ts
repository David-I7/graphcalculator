import {
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  parse,
  SymbolNode,
} from "mathjs";
import { Error } from "../../../../state/error/error";

function expressionErrorCreator(message: string): Error {
  return {
    type: "ExpressionError",
    message,
  };
}

export class ExpressionValidator {
  constructor() {}

  validateExpression(expr: string) {
    const trimmedContent = expr.replace(/\s/g, "");
    try {
      const node = parse(trimmedContent);
      if (node instanceof FunctionNode) {
        return this.validateFunctionNode(node);
      } else if (node instanceof FunctionAssignmentNode) {
        return this.validateFunctionAssignmentNode(node);
      }
      console.log(node);
    } catch (err) {
      if (err instanceof SyntaxError) {
        const index = Number(err.message[err.message.length - 2]);
        const cause = trimmedContent[index - 1] || trimmedContent[index - 2];

        console.log(err.message, trimmedContent);
        if (cause) {
          if (
            cause === "=" ||
            cause === "+" ||
            cause === "-" ||
            cause === "*" ||
            cause === "/"
          ) {
            return expressionErrorCreator(
              `You need something on both sides of the '${cause}' symbol.`
            );
          } else if (cause === "(") {
            return expressionErrorCreator(
              `Function '${trimmedContent[index - 3]}' is not defined.`
            );
          }
        } else {
          console.log(err.message, trimmedContent);
        }
      }
    }
  }

  validateFunctionNode(node: FunctionNode) {
    const requiredArgs = 1;

    if (node.fn instanceof SymbolNode) {
      if (node.args.length === requiredArgs) return;

      if (node.args.length > requiredArgs)
        return expressionErrorCreator(
          `We only support functions with 1 argument.`
        );
      else if (node.args.length < requiredArgs)
        return expressionErrorCreator(
          `Function '${node.fn.name}' is not defined.`
        );
    }
  }

  validateFunctionAssignmentNode(node: FunctionAssignmentNode) {
    const requiredArgs = 1;

    if (node.params.length > requiredArgs)
      return expressionErrorCreator(
        `We only support functions with 1 argument.`
      );
    else if (node.params.length < requiredArgs) {
      const variables = getSymbolNodes(node);

      return expressionErrorCreator(
        `Try including '${variables[0]}' as an argument by defining the function as 'f(${variables[0]})'.`
      );
    }
  }

  makeExpressionError(message: string) {
    return expressionErrorCreator(message);
  }
}

function getSymbolNodes(node: MathNode): SymbolNode[] {
  const symbolSet: Set<string> = new Set();
  return node.filter((node) => {
    if (node instanceof SymbolNode && node.name.length === 1) {
      if (!symbolSet.has(node.name)) {
        symbolSet.add(node.name);
        return true;
      }
    }
  }) as SymbolNode[];
}
