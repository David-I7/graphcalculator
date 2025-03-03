import {
  AssignmentNode,
  ConstantNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  OperatorNode,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import { ExpressionValidationResult, ExpressionValidator } from "./validation";
import { isGlobalFunctionRegex } from "../../data/math";
import {
  ClientExpressionData,
  ClientItem,
  ClientItemData,
  Scope,
} from "../../../../state/graph/types";
import { isInScope } from "../../../../state/graph/graph";

type TransformedResult =
  | {
      node: undefined;
      err: ApplicationError;
    }
  | {
      node: MathNode;
      err: undefined;
    };

export class ExpressionTransformer {
  protected validator: ExpressionValidator = new ExpressionValidator();
  constructor() {}

  transform(
    data: ClientItemData["expression"],
    globalScope: Scope
  ): TransformedResult {
    const trimmedContent = data.content.replace(/\s/g, "");
    const { node, err } = this.validator.validateSyntax(trimmedContent);

    if (err) {
      return { err, node: undefined };
    }

    const scope: Set<string> = new Set();
    Object.keys(globalScope).forEach((key) => scope.add(key));

    if (node instanceof FunctionAssignmentNode) {
      if (node.name !== "f" && isInScope(node.name, data, globalScope)) {
        return {
          err: this.validator.makeExpressionError(
            `
          You've defined '${node.name}' in more than one place. Try deleting some of the definitions of '${node.name}'.
          `,
            "duplicate_variable_declaration"
          ),
          node: undefined,
        };
      }

      if (node.params.length) {
        scope.add(node.params[0]);
      }
    } else if (node instanceof AssignmentNode) {
      if (!(node.object instanceof SymbolNode))
        return {
          err: this.validator.makeExpressionError(
            `node.object is not instanceOf SymbolNode`,
            "unknown"
          ),
          node: undefined,
        };

      const variable = node.object.name;

      if (variable === "y" || variable === "x") {
        const fn = new FunctionAssignmentNode(
          "f",
          [variable === "x" ? "y" : "x"],
          node.value
        );

        scope.add(fn.params[0]);

        return this.transformNode(fn, undefined, scope);
      } else {
        if (isInScope(variable, data, globalScope)) {
          return {
            err: this.validator.makeExpressionError(
              `
            You've defined '${variable}' in more than one place. Try deleting some of the definitions of '${variable}'.
            `,
              "duplicate_variable_declaration"
            ),
            node: undefined,
          };
        }

        scope.add(variable);
      }
    }

    console.log(scope);

    return this.transformNode(node, undefined, scope);
  }

  transformNode(
    outerNode: MathNode,
    outerParent: MathNode | undefined,
    scope: Set<string>
  ): TransformedResult {
    let transformedNode!: MathNode;
    let res!: ExpressionValidationResult;
    try {
      transformedNode = outerNode!.transform((innerNode, path, innerParent) => {
        console.log(outerNode === innerNode ? "outer" : "inner", innerNode);
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

          if (innerNode === res) {
            //skip
          } else {
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

          if (innerNode === res) {
            return innerNode;
          } else {
            const subNode = this.transformNode(res, parent, scope);
            if (subNode.err) throw subNode.err;
            return subNode.node;
          }
        }

        res = this.validator.validateNode(innerNode, parent, scope);
        if ("code" in res) {
          throw res;
        }

        return innerNode;
      });
    } catch (error) {
      console.log(error);
      return { err: error as ApplicationError, node: undefined };
    }

    console.log(transformedNode);
    return { err: undefined, node: transformedNode };
  }

  transformImplicitMultiplication(
    node: FunctionNode | SymbolNode,
    parent: MathNode | undefined,
    scope: Set<string>
  ): ExpressionValidationResult {
    if (node instanceof FunctionNode) {
      const matches = node.fn.name.matchAll(isGlobalFunctionRegex);

      if ("next" in matches) {
        for (const match of matches) {
          // case sin()
          if (match[0].length === match.input.length) return node;
          else if (match.index + match[0].length === match.input.length) {
            // case (random)sin()
            return new OperatorNode(
              "*",
              "multiply",
              [
                new SymbolNode(node.fn.name.substring(0, match.index)),
                new FunctionNode(
                  node.fn.name.substring(match.index),
                  node.args
                ),
              ],
              true
            );
          } else {
            //sinx index = 0
            //xsinx scenario(middle) or sinsinx
            //same error, function sin must have an argument

            return this.validator.makeExpressionError(
              `Function '${match[0]}' requires an argument. For example, try typing: '${match[0]}(x)'.`,
              "insuficient_function_arg"
            );
          }
        }
      }

      // no global functions
      // case xn() or x()
      // not implementing function composition yet

      return this.validator.makeExpressionError(
        `We do not support function composition.`,
        "function_composition_detected"
      );
    } else {
      // example input: xpc
      if (parent instanceof FunctionNode && node === parent.fn) return node;

      if (node.name.length === 1) {
        if (scope.has(node.name)) return node;
        return this.validator.makeExpressionError(
          `Too many variables, try defining '${node.name}'.`,
          "too_many_variables"
        );
      }

      let transformed!: OperatorNode<"*", "multiply", MathNode[]>;
      for (let i = 0; i < node.name.length - 1; i++) {
        if (scope.has(node.name[i]) && scope.has(node.name[i + 1])) {
          if (transformed) {
            transformed = new OperatorNode(
              "*",
              "multiply",
              [transformed, new SymbolNode(node.name[i])],
              true
            );
          } else {
            transformed = new OperatorNode(
              "*",
              "multiply",
              [new SymbolNode(node.name[i]), new SymbolNode(node.name[i + 1])],
              true
            );
          }
        } else {
          if (!scope.has(node.name[i])) {
            return this.validator.makeExpressionError(
              `Too many variables, try defining '${node.name[i]}'.`,
              "too_many_variables"
            );
          } else {
            return this.validator.makeExpressionError(
              `Too many variables, try defining '${node.name[i + 1]}'.`,
              "too_many_variables"
            );
          }
        }
      }

      return transformed;
    }
  }
}

export default new ExpressionTransformer();
