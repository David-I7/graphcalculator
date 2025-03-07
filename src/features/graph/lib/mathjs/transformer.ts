import {
  AssignmentNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  OperatorNode,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import { ExpressionValidationResult, ExpressionValidator } from "./validation";
import { GlobalMathConstants, isGlobalFunctionRegex } from "../../data/math";
import { ItemData, Scope } from "../../../../state/graph/types";
import { isInScope } from "../../../../state/graph/controllers";

type TransformedResult<T extends MathNode = MathNode> =
  | {
      node: undefined;
      err: ApplicationError;
    }
  | {
      node: T;
      err: undefined;
    };

export class ExpressionTransformer {
  protected validator: ExpressionValidator = new ExpressionValidator();
  constructor() {}

  transform(data: ItemData["expression"], scope: Scope): TransformedResult {
    const trimmedContent = data.content.replace(/\s/g, "");
    const { node, err } = this.validator.validateSyntax(trimmedContent);

    if (err) {
      return { err, node: undefined };
    }

    if (node instanceof FunctionAssignmentNode) {
      if (isInScope(node.name, data, scope)) {
        return {
          err: this.validator.makeExpressionError(
            `
          You've defined '${node.name}' in more than one place. Try deleting some of the definitions of '${node.name}'.
          `,
            "invalid_variable_declaration"
          ),
          node: undefined,
        };
      }

      if (node.params.length) {
        scope[node.params[0]] = 0;
      }
    } else if (node instanceof AssignmentNode) {
      const variable = node.object.name;

      if (variable === "f" || GlobalMathConstants.has(variable))
        return {
          err: this.validator.makeExpressionError(
            `'${variable}' is a restricted symbol. Try using a different one instead.`,
            "invalid_variable_declaration"
          ),
          node: undefined,
        };

      if (variable === "y" || variable === "x") {
        const fn = new FunctionAssignmentNode(
          "f",
          [variable === "x" ? "y" : "x"],
          node.value
        );

        scope[fn.params[0]] = 0;

        return this.transformNode(fn, undefined, scope);
      } else {
        if (isInScope(variable, data, scope)) {
          return {
            err: this.validator.makeExpressionError(
              `
            You've defined '${variable}' in more than one place. Try deleting some of the definitions of '${variable}'.
            `,
              "invalid_variable_declaration"
            ),
            node: undefined,
          };
        }
      }
    }

    return this.transformNode(node, undefined, scope);
  }

  transformNode(
    outerNode: MathNode,
    outerParent: MathNode | undefined,
    scope: Scope
  ): TransformedResult {
    let transformedNode!: MathNode;
    let res!: ExpressionValidationResult;
    try {
      transformedNode = outerNode!.transform((innerNode, path, innerParent) => {
        const parent = outerNode === innerNode ? outerParent : innerParent;

        if (innerNode instanceof FunctionNode) {
          const res = this.transformImplicitMultiplication(
            innerNode,
            parent,
            scope
          );
          if ("code" in res) {
            throw res;
          }

          if (innerNode !== res) {
            const subNode = this.transformNode(res, parent, scope);
            if (subNode.err) throw subNode.err;
            return subNode.node;
          }
        } else if (innerNode instanceof SymbolNode) {
          const res = this.transformImplicitMultiplication(
            innerNode,
            parent,
            scope
          );
          if ("code" in res) {
            throw res;
          }

          if (innerNode !== res && res instanceof OperatorNode) {
            const leftNode = this.transformNode(res.args[0], res, scope);
            if (leftNode.err) throw leftNode.err;
            const rightNode = this.transformNode(res.args[1], res, scope);
            if (rightNode.err) throw rightNode.err;
            return res;
          }
        } else if (innerNode instanceof OperatorNode && innerNode.op === "^") {
          if (innerNode.args[0] instanceof FunctionNode) {
            const left = this.transformNode(
              innerNode.args[0],
              innerNode,
              scope
            ) as TransformedResult<OperatorNode>;
            if (left.err) throw left.err;
            const right = this.transformNode(
              innerNode.args[1],
              innerNode,
              scope
            );
            if (right.err) throw right.err;

            innerNode.args[0] = left.node.args[1];
            left.node.args[1] = innerNode;
            return left.node;
          } else if (innerNode.args[0] instanceof SymbolNode) {
            if (
              innerNode.args[0].name.length > 1 &&
              !GlobalMathConstants.has(innerNode.args[0].name)
            ) {
              const left = this.transformNode(
                innerNode.args[0],
                innerNode,
                scope
              ) as TransformedResult<OperatorNode>;
              if (left.err) throw left.err;
              const right = this.transformNode(
                innerNode.args[1],
                innerNode,
                scope
              );
              if (right.err) throw right.err;

              innerNode.args[0] = left.node.args[1];
              left.node.args[1] = innerNode;
              return left.node;
            }
          }
        }

        res = this.validator.validateNode(innerNode, parent, scope);
        if ("code" in res) {
          throw res;
        }

        return innerNode;
      });
    } catch (error) {
      return { err: error as ApplicationError, node: undefined };
    }

    return { err: undefined, node: transformedNode };
  }

  splitMultiplication(
    node: SymbolNode,
    scope: Scope
  ): ExpressionValidationResult {
    if (GlobalMathConstants.has(node.name)) return node;

    const splitSymbol = (
      transformed: OperatorNode<"*", "multiply", MathNode[]> | undefined,
      start1: number,
      end1: number,
      end2?: number
    ) => {
      if (transformed) {
        transformed = new OperatorNode(
          "*",
          "multiply",
          [transformed, new SymbolNode(node.name.substring(start1, end1))],
          true
        );
      } else {
        transformed = new OperatorNode(
          "*",
          "multiply",
          [
            new SymbolNode(node.name.substring(start1, end1)),
            new SymbolNode(node.name.substring(end1, end2)),
          ],
          true
        );
      }

      return transformed;
    };

    const isPi = (str: string, i: number) => {
      return str[i] === "p" && str[i + 1] === "i";
    };

    const createError = (i: number) => {
      if (!(node.name[i] in scope)) {
        return this.validator.makeExpressionError(
          `Too many variables, try defining '${node.name[i]}'.`,
          "invalid_variable_declaration"
        );
      } else {
        return this.validator.makeExpressionError(
          `Too many variables, try defining '${node.name[i + 1]}'.`,
          "invalid_variable_declaration"
        );
      }
    };

    let transformed!: OperatorNode<"*", "multiply", MathNode[]>;
    let i = 0;
    while (i < node.name.length) {
      if (!transformed) {
        if (isPi(node.name, i)) {
          transformed = splitSymbol(transformed, i, i + 2, i + 3);
          i += 3;
        } else if (isPi(node.name, i + 1)) {
          transformed = splitSymbol(transformed, i, i + 1, i + 3);
          i += 3;
        } else if (node.name[i] in scope && node.name[i + 1] in scope) {
          transformed = splitSymbol(transformed, i, i + 1, i + 2);
          i += 2;
        } else {
          return createError(i);
        }
      } else {
        if (isPi(node.name, i)) {
          transformed = splitSymbol(transformed, i, i + 2);
          i += 2;
        } else if (node.name[i] in scope) {
          transformed = splitSymbol(transformed, i, i + 1);
          i += 1;
        } else {
          return createError(i);
        }
      }
    }

    return transformed;
  }

  transformImplicitMultiplication(
    node: FunctionNode | SymbolNode,
    parent: MathNode | undefined,
    scope: Scope
  ): ExpressionValidationResult {
    if (node instanceof FunctionNode) {
      if (!parent || node.fn.name.length === 1) return node;

      const match = node.fn.name.match(isGlobalFunctionRegex);
      if (match) {
        // case sin()
        if (match[0].length === match.input!.length) return node;
        else if (match.index! + match[0].length === match.input!.length) {
          // case (random)sin()
          return new OperatorNode(
            "*",
            "multiply",
            [
              new SymbolNode(node.fn.name.substring(0, match.index)),
              new FunctionNode(node.fn.name.substring(match.index!), node.args),
            ],
            true
          );
        } else {
          //xsinx
          //function sin must have an argument

          return this.validator.makeExpressionError(
            `Function '${match[0]}' requires an argument. For example, try typing: '${match[0]}(x)'.`,
            "invalid_function_declaration"
          );
        }
      }

      // case xn()
      // not implementing function composition yet

      const symbolNode = new SymbolNode(
        node.fn.name.substring(0, node.fn.name.length - 1)
      );
      const resNode = this.splitMultiplication(symbolNode, scope);
      console.log(symbolNode);
      if ("code" in resNode) return resNode;
      node.fn.name = node.fn.name.substring(node.fn.name.length - 1);
      const transformedNode = new OperatorNode(
        "*",
        "multiply",
        [resNode, node],
        true
      );

      console.log(transformedNode);
      return transformedNode;
    } else {
      // example input: xpc
      if (parent instanceof FunctionNode && node === parent.fn) return node;

      if (node.name.length === 1) return node;

      return this.splitMultiplication(node, scope);

      // const splitSymbol = (
      //   transformed: OperatorNode<"*", "multiply", MathNode[]> | undefined,
      //   start1: number,
      //   end1: number,
      //   end2?: number
      // ) => {
      //   if (transformed) {
      //     transformed = new OperatorNode(
      //       "*",
      //       "multiply",
      //       [transformed, new SymbolNode(node.name.substring(start1, end1))],
      //       true
      //     );
      //   } else {
      //     transformed = new OperatorNode(
      //       "*",
      //       "multiply",
      //       [
      //         new SymbolNode(node.name.substring(start1, end1)),
      //         new SymbolNode(node.name.substring(end1, end2)),
      //       ],
      //       true
      //     );
      //   }

      //   return transformed;
      // };

      // const isPi = (str: string, i: number) => {
      //   return str[i] === "p" && str[i + 1] === "i";
      // };

      // const createError = (i: number) => {
      //   if (!(node.name[i] in scope)) {
      //     return this.validator.makeExpressionError(
      //       `Too many variables, try defining '${node.name[i]}'.`,
      //       "invalid_variable_declaration"
      //     );
      //   } else {
      //     return this.validator.makeExpressionError(
      //       `Too many variables, try defining '${node.name[i + 1]}'.`,
      //       "invalid_variable_declaration"
      //     );
      //   }
      // };

      // let transformed!: OperatorNode<"*", "multiply", MathNode[]>;
      // let i = 0;
      // while (i < node.name.length) {
      //   if (!transformed) {
      //     if (isPi(node.name, i)) {
      //       transformed = splitSymbol(transformed, i, i + 2, i + 3);
      //       i += 3;
      //     } else if (isPi(node.name, i + 1)) {
      //       transformed = splitSymbol(transformed, i, i + 1, i + 3);
      //       i += 3;
      //     } else if (node.name[i] in scope && node.name[i + 1] in scope) {
      //       transformed = splitSymbol(transformed, i, i + 1, i + 2);
      //       i += 2;
      //     } else {
      //       return createError(i);
      //     }
      //   } else {
      //     if (isPi(node.name, i)) {
      //       transformed = splitSymbol(transformed, i, i + 2);
      //       i += 2;
      //     } else if (node.name[i] in scope) {
      //       transformed = splitSymbol(transformed, i, i + 1);
      //       i += 1;
      //     } else {
      //       return createError(i);
      //     }
      //   }
      // }

      // return transformed;
    }
  }
}

export default new ExpressionTransformer();
