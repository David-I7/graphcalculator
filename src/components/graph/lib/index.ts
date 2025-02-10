window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  setup(canvas, ctx);
});

function setup(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const observer = new ResizeObserver((entries) => {
    const canvasRect = entries[0].contentRect;
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
  });

  observer.observe(canvas);
}
