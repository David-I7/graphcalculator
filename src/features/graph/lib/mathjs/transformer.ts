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

    console.log(node);

    // node!.transform((node, path, parent) => {
    //   if (node instanceof SymbolNode) {
    //     this.validator;
    //   }

    //   return node;
    // });

    let vErr: ExpressionValidationResult = undefined;

    if (node instanceof ConstantNode) {
      vErr = this.validator.validateConstantNode(node, undefined);
    } else if (node instanceof SymbolNode) {
      vErr = this.validator.validateSymbolNode(node, undefined);
    } else if (node instanceof OperatorNode) {
      vErr = this.validator.validateOperatorNode(
        node as unknown as OperatorNode,
        undefined
      );
    } else if (node instanceof FunctionNode) {
      vErr = this.validator.validateFunctionNode(node, undefined);
    } else if (node instanceof FunctionAssignmentNode) {
      vErr = this.validator.validateFunctionAssignmentNode(node, undefined);
    }

    console.log(vErr);

    return { err: vErr, node: vErr ? undefined : node };
  }
}
