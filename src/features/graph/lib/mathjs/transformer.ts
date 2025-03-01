import {
  ConstantNode,
  FunctionAssignmentNode,
  FunctionNode,
  MathNode,
  OperatorNode,
  SymbolNode,
} from "mathjs";
import { ApplicationError } from "../../../../state/error/error";
import { ExpressionValidationResult, ExpressionValidator } from "./validation";

export class ExpressionTransformer {
  protected validator: ExpressionValidator = new ExpressionValidator();
  constructor() {}

  transform(expr: string): {
    err: ApplicationError | undefined;
    node: MathNode | undefined;
  } {
    const trimmedContent = expr.replace(/\s/g, "");
    const { node, err } = this.validator.validateSyntax(trimmedContent);

    if (err) {
      return { err, node: undefined };
    }
    if (err) console.log(err, "SyntaxError");

    let vErr: ExpressionValidationResult = undefined;

    vErr = this.validateNode(node!, undefined);
    node!.forEach((node, path, parent) => {
      console.log("inner ", node);
      vErr = this.validateNode(node, parent);
    });

    console.log("outter ", node);
    console.log(vErr);

    return { err: vErr, node: vErr ? undefined : node };
  }

  validateNode(node: MathNode, parent: MathNode | undefined) {
    if (node instanceof ConstantNode) {
      return this.validator.validateConstantNode(node, parent);
    } else if (node instanceof SymbolNode) {
      return this.validator.validateSymbolNode(node, parent);
    } else if (node instanceof OperatorNode) {
      return this.validator.validateOperatorNode(
        node as unknown as OperatorNode,
        parent
      );
    } else if (node instanceof FunctionNode) {
      return this.validator.validateFunctionNode(node, parent);
    } else if (node instanceof FunctionAssignmentNode) {
      return this.validator.validateFunctionAssignmentNode(node, parent);
    }
  }
}
