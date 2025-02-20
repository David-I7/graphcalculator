import { DrawAxisCommand, DrawGridCommand } from "./graph/commands";
import { Graph } from "./graph/graph";

// NOTES

let GRAPH!: Graph;

window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  setup(canvas, ctx);
});

export function setup(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const graph = new Graph(canvas, ctx);

  graph.addCommand(new DrawGridCommand(graph));
  graph.addCommand(new DrawAxisCommand(graph));

  function animate() {
    graph.clearCommands();
    graph.renderCommands();
    requestAnimationFrame(animate);
  }
  animate();

  GRAPH = graph;
}

export default GRAPH;
