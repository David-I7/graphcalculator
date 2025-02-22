import {
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  parse,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";

function expressionErrorCreator(message: string): {
  err: ApplicationError;
  node: undefined;
} {
  return {
    err: {
      type: "ExpressionError",
      message,
    },
    node: undefined,
  };
}

function expressionDebugErrorCreator(message: string): {
  err: ApplicationError;
  node: undefined;
} {
  return {
    err: {
      type: "ExpressionErrorDebug",
      message,
    },
    node: undefined,
  };
}

export class ExpressionValidator {
  constructor() {}

  validate(expr: string): {
    err: ApplicationError | undefined;
    node: MathNode | undefined;
  } {
    const trimmedContent = expr.replace(/\s/g, "");
    let node: MathNode;
    try {
      node = parse(trimmedContent);
      if (node instanceof FunctionNode) {
        const err = this.validateFunctionNode(node);
        return err ? err : { err: undefined, node };
      } else if (node instanceof FunctionAssignmentNode) {
        const err = this.validateFunctionAssignmentNode(node);
        return err ? err : { err: undefined, node };
      }
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
        const cause = trimmedContent[index - 1] || trimmedContent[index - 2];

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
          } else if (err.message.startsWith("Parenthesis")) {
            return expressionErrorCreator(`Try closing the parenthesis.`);
          } else {
            // console.log(err.message, trimmedContent, cause);
          }
        }
      }

      return expressionDebugErrorCreator(
        `Edge case not defined for syntaxError, \nDebug:\n${
          err as Error
        },\n${trimmedContent}
        `
      );
    }
  }

  protected validateFunctionNode(node: FunctionNode) {
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

  protected validateFunctionAssignmentNode(node: FunctionAssignmentNode) {
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
    } else {
      const variables = getSymbolNodes(node);
      // console.log(variables, node);
      if (variables.length === 1) {
        if (variables[0] !== node.params[0]) {
          return expressionErrorCreator(
            `Try including '${variables[0]}' as an argument by defining the function as 'f(${variables[0]})'.`
          );
        }
      }
      //  else if (variables.length > 1) {
      //   return expressionErrorCreator(
      //     `Too many variables, try defining '${variables.find(
      //       (variable) => variable !== node.params[0]
      //     )}'.`
      //   );
      // }
    }
  }

  makeExpressionError(message: string) {
    return expressionErrorCreator(message);
  }

  makeDebugError(message: string) {
    return expressionDebugErrorCreator(message);
  }
}

function getSymbolNodes(node: MathNode): string[] {
  const symbolSet: Set<string> = new Set();
  // console.log("root ", node);
  node.filter((node, path, parent) => {
    if (node instanceof SymbolNode) {
      if (parent instanceof FunctionNode) {
        // this is a function
        console.log(node.name, parent);
        return;
      }

      for (let i = 0; i < node.name.length; ++i) {
        if (!symbolSet.has(node.name[i])) {
          symbolSet.add(node.name[i]);
        }
      }
    }
  });

  return [...symbolSet.values()];
}
