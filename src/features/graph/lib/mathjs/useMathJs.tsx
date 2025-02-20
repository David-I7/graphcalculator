import { useEffect } from "react";
import { Expression } from "../../../../lib/api/graph";
import { parse } from "mathjs";
import { Graph } from "../graph/graph";
import { GraphCommand } from "../../interfaces";
import { useGraphContext } from "../../Graph";

type Scope = { f?: (x: number) => number };

const useMathJs = (expr: Expression) => {
  const graph = useGraphContext();

  useEffect(() => {
    if (!graph || !expr.content) return;
    let command: DrawFunctionCommand;

    try {
      const node = parse(expr.content);
      const code = node.compile();
      const scope: Scope = {};
      code.evaluate(scope);
      command = new DrawFunctionCommand(graph, expr, scope);
      graph.addCommand(command);
      // console.log(command, graph);
    } catch (err) {
      console.log(err);
    }

    return () => {
      graph.removeCommand(command);
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

  constructor(public graph: Graph, expr: Expression, public scope: Scope) {
    this.color = expr.color!;
    this.hidden = expr.hidden!;
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
            (this.scope.f!(i + nextStep) / this.graph.scales.scaler) *
            this.graph.scales.scaledStep
          );
        if (isNaN(curY)) {
          console.log(i, "isNan");
          continue;
        }

        nextX =
          (i + nextStep) *
          (this.graph.scales.scaledStep / this.graph.scales.scaler);

        nextY = -(
          (this.scope.f!(i + nextStep) / this.graph.scales.scaler) *
          this.graph.scales.scaledStep
        );
        if (isNaN(nextY)) {
          // console.log(i + nextStep, "isNan");
          continue;
        }
        // console.log(scaledX, scaledY);

        this.graph.ctx.moveTo(curX, curY);
        this.graph.ctx.lineTo(nextX, nextY);
        this.graph.ctx.stroke();
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.graph.ctx.restore();
    }
  }

  update(): void {}
}
