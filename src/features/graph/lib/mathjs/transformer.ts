import {
  AssignmentNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  OperatorNode,
  ParenthesisNode,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import {
  ExpressionValidationResult,
  ExpressionValidator,
  ValidationContext,
} from "./validation";
import { GlobalMathConstants, isGlobalFunctionRegex } from "../../data/math";
import { ItemData, Scope } from "../../../../state/graph/types";

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

    if (node instanceof AssignmentNode) {
      const variable = node.object.name;

      if (variable === "y" || variable === "x") {
        const fn = new FunctionAssignmentNode(
          "f",
          [variable === "x" ? "y" : "x"],
          node.value
        );

        const transformContext: ValidationContext = {
          type: "functionAssignment",
          scope,
          variable: fn.params[0],
        };

        return this.transformNode(fn, undefined, transformContext);
      }
    }

    const ctx = this.validator.initializeContext(node, data, scope);
    if ("code" in ctx) return { err: ctx, node: undefined };
    return this.transformNode(node, undefined, ctx);
  }

  transformNode(
    outerNode: MathNode,
    outerParent: MathNode | undefined,
    ctx: ValidationContext
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
            ctx
          );
          if ("code" in res) throw res;
          if (res instanceof OperatorNode) {
            const leftNode = this.transformNode(res.args[0], res, ctx);
            if (leftNode.err) throw leftNode.err;
            const rightNode = this.transformNode(res.args[1], res, ctx);
            if (rightNode.err) throw rightNode.err;
            return res;
          }
        } else if (innerNode instanceof SymbolNode) {
          const res = this.transformImplicitMultiplication(
            innerNode,
            parent,
            ctx
          );
          if ("code" in res) throw res;

          if (res instanceof OperatorNode) {
            const leftNode = this.transformNode(res.args[0], res, ctx);
            if (leftNode.err) throw leftNode.err;
            const rightNode = this.transformNode(res.args[1], res, ctx);
            if (rightNode.err) throw rightNode.err;
            return res;
          }
        } else if (innerNode instanceof OperatorNode && innerNode.op === "^") {
          const res = this.transformPowerOperator(innerNode, ctx);
          if ("code" in res) throw res;

          if (innerNode !== res) {
            return res;
          }
        }

        res = this.validator.validateNode(innerNode, parent, ctx);
        if ("code" in res) throw res;

        return innerNode;
      });
    } catch (error) {
      return { err: error as ApplicationError, node: undefined };
    }

    return { err: undefined, node: transformedNode };
  }

  splitMultiplication(node: SymbolNode): ExpressionValidationResult {
    if (GlobalMathConstants.has(node.name)) return node;
    if (node.name.length === 1) return node;

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
        } else {
          transformed = splitSymbol(transformed, i, i + 1, i + 2);
          i += 2;
        }
      } else {
        if (isPi(node.name, i)) {
          transformed = splitSymbol(transformed, i, i + 2);
          i += 2;
        } else {
          transformed = splitSymbol(transformed, i, i + 1);
          i += 1;
        }
      }
    }

    return transformed;
  }

  splitFunctionNode(node: FunctionNode) {
    if (node.args.length !== 1) return node;

    return new OperatorNode(
      "*",
      "multiply",
      [new SymbolNode(node.fn.name), new ParenthesisNode(node.args[0])],
      false
    );
  }

  transformPowerOperator(
    node: OperatorNode<"^", "pow">,
    ctx: ValidationContext
  ): ExpressionValidationResult {
    if (node.args[0] instanceof FunctionNode) {
      const left = this.transformNode(
        node.args[0],
        node,
        ctx
      ) as TransformedResult<OperatorNode | FunctionNode>;
      if (left.err) throw left.err;
      const right = this.transformNode(node.args[1], node, ctx);
      if (right.err) throw right.err;

      if (left.node instanceof FunctionNode) {
        node.args[1] = right.node;
        return new OperatorNode("^", "pow", node.args, false);
      }

      node.args[0] = left.node.args[1];
      node.args[1] = right.node;
      left.node.args[1] = node;
      return left.node;
    } else if (node.args[0] instanceof SymbolNode) {
      if (
        node.args[0].name.length > 1 &&
        !GlobalMathConstants.has(node.args[0].name)
      ) {
        const left = this.transformNode(
          node.args[0],
          node,
          ctx
        ) as TransformedResult<OperatorNode>;
        if (left.err) throw left.err;
        const right = this.transformNode(node.args[1], node, ctx);
        if (right.err) throw right.err;

        node.args[0] = left.node.args[1];
        node.args[1] = right.node;
        left.node.args[1] = node;
        return left.node;
      }
    }

    return node;
  }

  transformImplicitMultiplication(
    node: FunctionNode | SymbolNode,
    parent: MathNode | undefined,
    ctx: ValidationContext
  ): ExpressionValidationResult {
    if (node instanceof FunctionNode) {
      // s()
      if (!parent || node.fn.name.length === 1) {
        if (
          node.fn.name in ctx.scope &&
          ctx.scope[node.fn.name].type === "function"
        ) {
          return node;
        } else {
          return this.splitFunctionNode(node);
        }
      }

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
      const symbolNode = new SymbolNode(
        node.fn.name.substring(0, node.fn.name.length - 1)
      );
      const resNode = this.splitMultiplication(symbolNode);
      if ("code" in resNode) return resNode;
      node.fn.name = node.fn.name.substring(node.fn.name.length - 1);
      const transformedNode = new OperatorNode(
        "*",
        "multiply",
        [resNode, node],
        true
      );

      return transformedNode;
    } else {
      // example input: xpc
      if (parent instanceof FunctionNode && node === parent.fn) return node;

      return this.splitMultiplication(node);
    }
  }
}

export default new ExpressionTransformer();
