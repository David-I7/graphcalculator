import { useEffect, useRef } from "react";
import {
  AssignmentNode,
  derivative,
  evaluate,
  FunctionAssignmentNode,
  log,
  MathNode,
  ParenthesisNode,
} from "mathjs";
import { Graph } from "../graph/graph";
import { useGraphContext } from "../../Graph";
import { ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import {
  ApplicationError,
  clearError,
  setError,
} from "../../../../state/error/error";
import { DrawFunctionCommand, ExprData } from "../graph/commands";
import { ExpressionTransformer } from "./transformer";
import {
  setFocusedItem,
  resetFocusedItem,
} from "../../../../state/graph/graph";
import {
  ClientExpressionState,
  ClientItem,
} from "../../../../state/graph/types";

type FunctionDeclaration = Record<string, (input: number) => number>;

const useMathJs = (
  expr: ClientItem<"expression">,
  focused: boolean,
  idx: number,
  globalScope: Record<string, number>
) => {
  if (expr.data.type === "variable") return;
  const graph = useGraphContext();
  // const exprParser = useRef(new MathJsParser());
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  // useEffect(() => {
  //   if (!graph) return;
  //   if ( expr.data.type === "variable") return

  //   if (!expr.data.content.length) {
  //     dispatch(clearError(expr.id));
  //     return;
  //   }

  //   const { err, node } = exprParser.current.transform(expr.data.content);

  //   let parsedCommand!: DrawFunctionCommand | ApplicationError;
  //   const exprState: ExprData = {
  //     color: expr.data.settings.color,
  //     hidden: expr.data.settings.hidden,
  //     state: focused ? "focused" : "idle",
  //     onStateChange(prev, cur) {
  //       if (prev === cur) return;

  //       if (cur === "idle") {
  //         dispatch(resetFocusedItem(expr.id));
  //       } else {
  //         dispatch(setFocusedItem(expr.id));
  //       }
  //     },
  //   };
  //   if (node) {
  //     parsedCommand = exprParser.current.parse(node!, graph, exprState);
  //   }

  //   if (err) {
  //     dispatch(setError({ id: expr.id, error: err }));
  //   } else if (!(parsedCommand instanceof DrawFunctionCommand)) {
  //     dispatch(setError({ id: expr.id, error: parsedCommand }));
  //   } else {
  //     dispatch(clearError(expr.id));
  //     command.current = parsedCommand;
  //     graph.addCommand(command.current);
  //   }

  //   return () => {
  //     if (parsedCommand instanceof DrawFunctionCommand) {
  //       graph.removeCommand(parsedCommand);
  //       parsedCommand.destroy();
  //     }
  //   };
  // }, [expr.data.content, graph]);

  useEffect(() => {
    if (expr.data.type === "variable") return;
    if (!command.current) return;

    command.current.settings.color = expr.data.settings.color;
    command.current.settings.hidden = expr.data.settings.hidden;
  }, [expr.data.settings.color, expr.data.settings.hidden]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.state === "idle" && focused) {
      command.current.setState("focused");
    } else if (command.current.state === "focused" && !focused) {
      command.current.setState("idle");
    }
  }, [focused]);
};

export default useMathJs;

// class MathJsParser {
//   protected validator: ExpressionValidator = new ExpressionValidator();
//   protected transformer: ExpressionTransformer = new ExpressionTransformer();
//   constructor() {}

//   transform(expr: string): {
//     err: ApplicationError | undefined;
//     node: MathNode | undefined;
//   } {
//     return this.transformer.transform(expr);
//   }

//   parse(
//     node: MathNode,
//     graph: Graph,
//     exprState: ExprData
//   ): ApplicationError | DrawFunctionCommand {
//     if (node instanceof FunctionAssignmentNode) {
//       const df = this.createDerivativeData(node);

//       const fnData: FnData = {
//         f: this.createFunctionData(node),
//         df: this.createDerivativeData(node),
//         ddf: this.createDerivativeData(df.node),
//       };

//       return new DrawFunctionCommand(graph, fnData, exprState);
//     } else if (node instanceof AssignmentNode) {
//       const variable = node.object.name;

//       // implicit function
//       if (variable === "y" || variable === "x") {
//         const fn = new FunctionAssignmentNode(
//           "f",
//           [variable === "x" ? "y" : "x"],
//           node.value
//         );

//         const df = this.createDerivativeData(fn);

//         const fnData: FnData = {
//           f: this.createFunctionData(fn),
//           df,
//           ddf: this.createDerivativeData(df.node),
//         };

//         return new DrawFunctionCommand(graph, fnData, exprState);
//       } else {
//         // variable Assignment
//       }
//     } else if (node instanceof ParenthesisNode) {
//       return this.validator.makeDebugError(
//         `Point not implemented. \nDebug:\n${node}`
//       ).err as ApplicationError;
//     }

//     return this.validator.makeDebugError(
//       `Edge case not defined at parse. \nDebug:\n${node}`
//     ).err as ApplicationError;
//   }

//   createFunctionData(node: FunctionAssignmentNode): FnData["f"] {
//     const code = node.compile();
//     const scope: FunctionDeclaration = {};
//     code.evaluate(scope);

//     //y or x intercept
//     const inputIntercept = node.expr.evaluate({ [node.params[0]]: 0 });

//     return {
//       param: node.params[0],
//       f: scope[node.name],
//       inputIntercept: Number.isFinite(inputIntercept)
//         ? inputIntercept
//         : undefined,
//       outputIntercepts: [],
//       node,
//     };
//   }

//   createDerivativeData(node: FunctionAssignmentNode): FnData["df"] {
//     // derivative can be undefined! if function is not continuous

//     const derivativeNode = derivative(node, node.params["0"], {
//       simplify: false,
//     });
//     const derivativeFunctionAssignmentNode = new FunctionAssignmentNode(
//       "f",
//       node.params,
//       derivativeNode
//     );

//     const code = derivativeFunctionAssignmentNode.compile();
//     const scope: FunctionDeclaration = {};
//     code.evaluate(scope);

//     return {
//       node: derivativeFunctionAssignmentNode,
//       param: derivativeFunctionAssignmentNode.params[0],
//       f: scope[derivativeFunctionAssignmentNode.name],
//       criticalPoints: [],
//     };
//   }
// }
