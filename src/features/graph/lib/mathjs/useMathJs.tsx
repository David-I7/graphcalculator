import { useEffect, useRef } from "react";
import { Expression } from "../../../../lib/api/graph";
import { parse } from "mathjs";
import { Graph } from "../graph/graph";
import { GraphCommand } from "../../interfaces";

type Scope = { f?: (x: number) => number };

const useMathJs = (expr: Expression) => {
  const parser = useRef(new MathJsParser());

  useEffect(() => {
    try {
      const node = parse(expr.content);
      const code = node.compile();
      const scope: Scope = {};
      code.evaluate(scope);
      const result = scope.f?.(10);
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }, [expr]);
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
  public color: String;
  public hidden: boolean;

  constructor(public graph: Graph, expr: Expression, public scope: Scope) {
    this.color = expr.color!;
    this.hidden = expr.hidden!;
  }

  draw(): void {
    this.graph.scales;
  }

  update(): void {}
}
