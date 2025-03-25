import { DrawAxisCommand, DrawGridCommand } from "./graph/commands";
import { Graph } from "./graph/graph";

// NOTES

export function setup(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const graph = new Graph(canvas, ctx);

  graph.addCommand(new DrawGridCommand(graph));
  graph.addCommand(new DrawAxisCommand(graph));

  function animate() {
    if (graph.destroyed) return;

    graph.clearCommands();
    graph.renderCommands();
    requestAnimationFrame(animate);
  }
  animate();

  return graph;
}
