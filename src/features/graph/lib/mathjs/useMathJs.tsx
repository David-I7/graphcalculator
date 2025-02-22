import { useEffect, useRef } from "react";
import { Expression } from "../../../../lib/api/graph";
import { AssignmentNode, FunctionAssignmentNode, parse } from "mathjs";
import { Graph } from "../graph/graph";
import { GraphCommand, MouseEventData } from "../../interfaces";
import { useGraphContext } from "../../Graph";
import { ExpressionValidator } from "./validation";
import { useAppDispatch } from "../../../../state/hooks";
import { clearError, setError } from "../../../../state/error/error";

type Scope = Record<string, (input: number) => number>;

const useMathJs = (expr: Expression<"expression">) => {
  const graph = useGraphContext();
  const exprValidator = useRef(new ExpressionValidator());
  const dispatch = useAppDispatch();

  useEffect(() => {
    // if (Boolean(1) === true) return;
    if (!graph || !expr.data.content) return;
    let command: DrawFunctionCommand;

    const err = exprValidator.current.validateExpression(expr.data.content);

    if (err) {
      dispatch(setError({ id: expr.id, error: err }));
    } else {
      dispatch(clearError(expr.id));
    }

    // try {

    //   const node = parse(expr.data.content);
    //   console.log(node);
    //   if (node instanceof FunctionAssignmentNode) {
    //     if (node.params.length === 2 || !node.params.length) return;
    //     const code = node.compile();
    //     const scope: Scope = {};
    //     code.evaluate(scope);
    //     const derivedScope = {
    //       [node.params[0]]: scope[node.name],
    //     };
    //     command = new DrawFunctionCommand(graph, expr, derivedScope);
    //     graph.addCommand(command);
    //   } else if (node instanceof AssignmentNode) {
    //     const symbol = node.object.name;
    //     // implicit function
    //     if (symbol === "y" || symbol === "x") {
    //       const fn = new FunctionAssignmentNode(
    //         "f",
    //         [symbol === "x" ? "y" : "x"],
    //         node.value
    //       );
    //       const code = fn.compile();
    //       const scope: Scope = {};
    //       code.evaluate(scope);
    //       const derivedScope = {
    //         [fn.params[0]]: scope.f,
    //       };
    //       command = new DrawFunctionCommand(graph, expr, derivedScope);
    //       graph.addCommand(command);
    //     }
    //   }
    // } catch (err) {
    //   // console.log(err);
    // }

    return () => {
      // if (command) {
      //   graph.removeCommand(command);
      //   command.destroy();
      // }
    };
  }, [expr, graph]);
};

export default useMathJs;

class MathJsParser {
  protected expressions: Map<number, Expression> = new Map();
  constructor() {}

  insert(expr: Expression | Expression[]) {
    if (Array.isArray(expr)) {
      for (let i = 0; i < expr.length; ++i) {
        if (expr[i].type !== "expression" || this.expressions.has(expr[i].id))
          continue;
        this.expressions.set(expr[i].id, expr[i]);
      }
    } else {
      if (expr.type !== "expression" || this.expressions.has(expr.id))
        this.expressions.set(expr.id, expr);
    }
  }
}

export class DrawFunctionCommand implements GraphCommand {
  public color: string;
  public hidden: boolean;
  protected boundHandleMouseDown: ReturnType<typeof this.handleMouseDown.bind>;

  constructor(
    public graph: Graph,
    expr: Expression<"expression">,
    public fn: Scope
  ) {
    this.color = expr.data.color!;
    this.hidden = expr.data.hidden!;
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.graph.on("mouseDown", this.boundHandleMouseDown);
  }

  draw(): void {
    if (this.hidden) return;

    try {
      this.graph.ctx.save();

      this.graph.ctx.strokeStyle = this.color;
      this.graph.ctx.lineWidth = 4;

      // for tooltip
      // 1 box = 1 tile
      // x = 1 tile * scaler

      if (this.fn["x"]) {
        const fn = this.fn["x"];

        // approaching from the left side
        const leftTiles =
          (this.graph.clientLeft || 0.01) / this.graph.scales.scaledStep;
        const minX = leftTiles * this.graph.scales.scaler;

        // // approaching from the right side
        const rightTiles =
          (this.graph.clientRight || -0.01) / this.graph.scales.scaledStep;
        const maxX = rightTiles * this.graph.scales.scaler;

        let nextX: number | undefined;
        let nextY: number | undefined;
        const nextStep: number = 0.01 * this.graph.scales.scaler;
        // console.log(minX, maxX, nextStep);

        for (let i = minX; i < maxX; i += nextStep) {
          this.graph.ctx.beginPath();
          const curX =
            nextX ??
            i * (this.graph.scales.scaledStep / this.graph.scales.scaler);
          const curY =
            nextY ??
            -(
              (fn(i + nextStep) / this.graph.scales.scaler) *
              this.graph.scales.scaledStep
            );
          if (isNaN(curY)) continue;

          nextX =
            (i + nextStep) *
            (this.graph.scales.scaledStep / this.graph.scales.scaler);

          nextY = -(
            (fn(i + nextStep) / this.graph.scales.scaler) *
            this.graph.scales.scaledStep
          );
          if (isNaN(nextY)) continue;

          this.graph.ctx.moveTo(curX, curY);
          this.graph.ctx.lineTo(nextX, nextY);
          this.graph.ctx.stroke();
        }
      } else if (this.fn["y"]) {
        const fn = this.fn["y"];

        // approaching from the left side
        const topTiles =
          (this.graph.clientTop || 0.01) / this.graph.scales.scaledStep;
        const minY = topTiles * this.graph.scales.scaler;

        // // approaching from the right side
        const bottomTiles =
          (this.graph.clientBottom || -0.01) / this.graph.scales.scaledStep;
        const maxY = bottomTiles * this.graph.scales.scaler;

        let nextX: number | undefined;
        let nextY: number | undefined;
        const nextStep = 0.01 * this.graph.scales.scaler;

        for (let y = minY; y < maxY; y += nextStep) {
          this.graph.ctx.beginPath();
          const curY =
            nextY ??
            y * (this.graph.scales.scaledStep / this.graph.scales.scaler);
          const curX =
            nextX ??
            (fn(-y) * this.graph.scales.scaledStep) / this.graph.scales.scaler;
          if (isNaN(curX)) continue;

          nextY =
            (y + nextStep) *
            (this.graph.scales.scaledStep / this.graph.scales.scaler);
          nextX =
            (fn(-y + nextStep) * this.graph.scales.scaledStep) /
            this.graph.scales.scaler;
          if (isNaN(nextX)) continue;

          this.graph.ctx.moveTo(curX, curY);
          this.graph.ctx.lineTo(nextX, nextY);
          this.graph.ctx.stroke();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.graph.ctx.restore();
    }
  }

  handleMouseDown(e: MouseEventData) {
    if (this.hidden) return;

    if (this.fn["x"]) {
      const y = this.fn["x"](e.graphX);

      const tolerance = 0.25 * this.graph.scales.scaler;
      const offset = Math.abs(y) - Math.abs(e.graphY);

      if (offset < tolerance && offset > -tolerance) {
        e.preventDefault(
          `Calling from function of X because ${tolerance} > ${offset} > ${-tolerance} `
        );
      }
    } else if (this.fn["y"]) {
      const x = this.fn["y"](-e.graphY);

      const tolerance = 0.25 * this.graph.scales.scaler;
      const offset = Math.abs(x) - Math.abs(e.graphX);

      if (offset < tolerance && offset > -tolerance) {
        e.preventDefault(
          `Calling from function of Y because ${tolerance} > ${offset} > ${-tolerance} `
        );
      }
    }
  }

  destroy(): void {
    this.graph.removeListener("mouseDown", this.boundHandleMouseDown);
  }
}
