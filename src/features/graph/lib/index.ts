import { DrawAxisCommand, DrawGridCommand } from "./commands";
import { Graph } from "./graph";

// NOTES

window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  setup(canvas, ctx);
});

function setup(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const graph = new Graph(canvas, ctx);

  graph.addCommand(new DrawGridCommand(graph));
  graph.addCommand(new DrawAxisCommand(graph));

  function animate() {
    graph.clearCommands();
    graph.renderCommands();
    requestAnimationFrame(animate);
  }
  animate();
}
