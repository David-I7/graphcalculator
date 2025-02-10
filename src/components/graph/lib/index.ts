import { debounce } from "../../../helpers/performance";
import { CSS_VARIABLES } from "../../../data/css/variables";

window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  setup(canvas, ctx);
});

function setup(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.translate(Math.round(canvas.width / 2), Math.round(canvas.height / 2));

  const graph = new Graph(
    canvas,
    ctx,
    new DrawGridCommand(canvas, ctx, 25),
    new DrawAxisCommand(canvas, ctx)
  );

  function animate() {
    graph.clear();
    graph.render();
    requestAnimationFrame(animate);
  }
  animate();
}

interface Command {
  draw(): void;
  reset(cx: number, cy: number): void;
}

// class GridCell {
//   constructor(public x: number, public y: number, public size: number) {}
//   draw(ctx: CanvasRenderingContext2D) {
//     ctx.strokeRect(this.x, this.y, this.size, this.size);
//   }
// }

class DrawGridCommand implements Command {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected ctx: CanvasRenderingContext2D,
    public step: number
  ) {}

  draw(): void {
    this.ctx.save();
    this.ctx.strokeStyle = CSS_VARIABLES.borderLowest;
    this.ctx.lineWidth = 0.5;

    const canvasCenterX = Math.round(this.canvas.width / 2);
    const canvasCenterY = Math.round(this.canvas.height / 2);
    let count: number = 1;

    for (let x = -this.step; x > -canvasCenterX; x -= this.step) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(x, -canvasCenterY);
      this.ctx.lineTo(x, canvasCenterY);
      this.ctx.stroke();
      if (count % 5 === 0) {
        this.ctx.restore();
      }
      count++;
    }

    count = 1;
    for (let x = this.step; x < canvasCenterX; x += this.step) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(x, -canvasCenterY);
      this.ctx.lineTo(x, canvasCenterY);
      this.ctx.stroke();
      if (count % 5 === 0) {
        this.ctx.restore();
      }
      count++;
    }

    count = 1;
    for (let y = -this.step; y > -canvasCenterY; y -= this.step) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(-canvasCenterX, y);
      this.ctx.lineTo(canvasCenterX, y);
      this.ctx.stroke();
      if (count % 5 === 0) {
        this.ctx.restore();
      }

      count++;
    }

    count = 1;
    for (let y = this.step; y < canvasCenterY; y += this.step) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(-canvasCenterX, y);
      this.ctx.lineTo(canvasCenterX, y);
      this.ctx.stroke();
      if (count % 5 === 0) {
        this.ctx.restore();
      }

      count++;
    }

    this.ctx.restore();
  }

  reset(cx: number, cy: number): void {}

  update(): void {}
}

class DrawAxisCommand implements Command {
  protected canvasCenterX: number;
  protected canvasCenterY: number;
  constructor(
    protected canvas: HTMLCanvasElement,
    protected ctx: CanvasRenderingContext2D
  ) {
    this.canvasCenterY = Math.round(canvas.height / 2);
    this.canvasCenterX = Math.round(canvas.width / 2);
  }
  draw() {
    this.ctx.strokeStyle = CSS_VARIABLES.borderHigh;
    this.ctx.fillStyle = CSS_VARIABLES.borderHigh;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.canvasCenterY);
    this.ctx.lineTo(-6, -this.canvasCenterY + 10);
    this.ctx.lineTo(+6, -this.canvasCenterY + 10);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.lineTo(0, this.canvasCenterY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.canvasCenterX, 0);
    this.ctx.lineTo(this.canvasCenterX - 10, -6);
    this.ctx.lineTo(this.canvasCenterX - 10, +6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.lineTo(-this.canvasCenterX, 0);
    this.ctx.stroke();
  }

  reset(cx: number, cy: number): void {
    this.canvasCenterX = cx;
    this.canvasCenterY = cy;
  }

  update(): void {}
}

class Graph {
  protected commands: Command[];
  protected canvasCenterX: number;
  protected canvasCenterY: number;
  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
    ...commands: Command[]
  ) {
    this.commands = commands;
    this.canvasCenterX = Math.round(canvas.width / 2);
    this.canvasCenterY = Math.round(canvas.height / 2);

    const observer = new ResizeObserver(
      debounce(() => {
        if (
          canvas.width > canvas.offsetWidth + 1 ||
          canvas.width < canvas.offsetWidth - 1 ||
          canvas.height > canvas.offsetHeight + 1 ||
          canvas.height < canvas.offsetHeight - 1
        ) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
          this.canvasCenterX = Math.round(canvas.width / 2);
          this.canvasCenterY = Math.round(canvas.height / 2);
          this.ctx.translate(
            Math.round(this.canvasCenterX),
            Math.round(this.canvasCenterY)
          );
          this.reset();
        }
      }, 50)
    );

    observer.observe(canvas.parentElement!);
  }

  register(command: Command) {
    this.commands.push(command);
  }

  unRegister(command: Command) {
    for (let i = 0; i < this.commands.length; ++i) {
      if (this.commands[i] === command) {
        this.commands.splice(i, 1);
      }
    }
  }

  reset() {
    this.commands.forEach((command) => {
      command.reset(this.canvasCenterX, this.canvasCenterY);
    });
  }

  render() {
    this.commands.forEach((command) => {
      command.draw();
    });
  }

  clear() {
    this.ctx.clearRect(
      -this.canvasCenterX,
      -this.canvasCenterY,
      this.canvas.width,
      this.canvas.height
    );
  }
}
