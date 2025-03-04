import {
  AssignmentNode,
  ConstantNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  ObjectNode,
  OperatorNode,
  ParenthesisNode,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import { ExpressionValidationResult, ExpressionValidator } from "./validation";
import { isGlobalFunctionRegex } from "../../data/math";
import { ItemData, Scope } from "../../../../state/graph/types";
import { isInScope } from "../../../../state/graph/graph";

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

  transform(
    data: ItemData["expression"],
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
      if (node.params.length) {
        scope.add(node.params[0]);
      }
    } else if (node instanceof AssignmentNode) {
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
    } else if (node instanceof ObjectNode) {
      console.log(node);
      const data: ItemData["expression"] = {
        type: "point",
        parsedContent: undefined,
        content: node.properties.x.name,
        settings: {
          color: "",
          hidden: false,
        },
      };
      const x = this.transform(data, globalScope);

      if (x.err) return { err: x.err, node: undefined };

      data.content = node.properties.y.name;
      const y = this.transform(data, globalScope);

      if (y.err) return { err: y.err, node: undefined };

      console.log(x, y);

      return {
        err: this.validator.makeExpressionError(
          "Point not implemented",
          "unsupported_feature"
        ),
        node: undefined,
      };
    }

    return this.transformNode(node, undefined, scope);
  }

  // transformRecursive(expr:string,parent:MathNode | undefined,scope:Set<string>){
  //   const { node, err } = this.validator.validateSyntax(expr);

  //   if (err) {
  //     return { err, node: undefined };
  //   }

  //   if (node instanceof FunctionAssignmentNode) {
  //     if (node.params.length) {
  //       scope.add(node.params[0]);
  //     }
  //   } else if (node instanceof AssignmentNode) {
  //     if (!(node.object instanceof SymbolNode))
  //       return {
  //         err: this.validator.makeExpressionError(
  //           `node.object is not instanceOf SymbolNode`,
  //           "unknown"
  //         ),
  //         node: undefined,
  //       };

  //     const variable = node.object.name;

  //     if (variable === "y" || variable === "x") {
  //       const fn = new FunctionAssignmentNode(
  //         "f",
  //         [variable === "x" ? "y" : "x"],
  //         node.value
  //       );

  //       scope.add(fn.params[0]);

  //       return this.transformNode(fn, undefined, scope);
  //     } else {
  //       if (isInScope(variable, data, globalScope)) {
  //         return {
  //           err: this.validator.makeExpressionError(
  //             `
  //           You've defined '${variable}' in more than one place. Try deleting some of the definitions of '${variable}'.
  //           `,
  //             "duplicate_variable_declaration"
  //           ),
  //           node: undefined,
  //         };
  //       }

  //       scope.add(variable);
  //     }
  //   } else if (node instanceof ObjectNode) {
  //     console.log(node);

  //     const x = this.transformRecursive(node.properties.x.name,new ParenthesisNode(node.properties.x) ,scope);

  //     if (x.err) return { err: x.err, node: undefined };

  //     data.content = node.properties.y.name;
  //     const y = this.transform(data, globalScope);

  //     if (y.err) return { err: y.err, node: undefined };

  //     console.log(x, y);

  //     return {
  //       err: this.validator.makeExpressionError(
  //         "Point not implemented",
  //         "unsupported_feature"
  //       ),
  //       node: undefined,
  //     };
  //   }

  //   console.log(scope);

  //   return this.transformNode(node, undefined, scope);
  // }

  transformNode(
    outerNode: MathNode,
    outerParent: MathNode | undefined,
    scope: Set<string>
  ): TransformedResult {
    // debugger;
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
            if (innerNode.args[0].name.length > 1) {
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
      console.log(error);
      return { err: error as ApplicationError, node: undefined };
    }

    return { err: undefined, node: transformedNode };
  }

  transformImplicitMultiplication(
    node: FunctionNode | SymbolNode,
    parent: MathNode | undefined,
    scope: Set<string>
  ): ExpressionValidationResult {
    if (node instanceof FunctionNode) {
      if (!parent || node.fn.name.length === 1) return node;

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
        "unsupported_feature"
      );
    }
    // else if (node instanceof OperatorNode){
    //   // if (parent instanceof OperatorNode && parent.op === "^") {
    //   //   // debugger;
    //   //   return new OperatorNode(
    //   //     "*",
    //   //     "multiply",
    //   //     [
    //   //       new SymbolNode(node.name.substring(0, node.name.length - 1)),
    //   //       new OperatorNode(
    //   //         "^",
    //   //         "pow",
    //   //         [
    //   //           new SymbolNode(node.name.substring(node.name.length - 1)),
    //   //           parent.args[1],
    //   //         ],
    //   //         false
    //   //       ),
    //   //     ],
    //   //     true
    //   //   );
    //   // }
    // }
    else {
      // example input: xpc
      if (parent instanceof FunctionNode && node === parent.fn) return node;

      if (node.name.length === 1) return node;

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
