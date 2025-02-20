import { GraphCommand } from "../../interfaces";
import { Graph } from "../graph/graph";

export class DrawFunctionCommand implements GraphCommand {
  constructor(public graph: Graph) {}

  draw(): void {}

  update(): void {}
}
