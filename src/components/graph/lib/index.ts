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
  const graph = new Graph(canvas, ctx);

  graph.register(new DrawGridCommand(canvas, ctx, 25));
  graph.register(new DrawAxisCommand(canvas, ctx));

  function animate() {
    graph.clear();
    graph.render();
    requestAnimationFrame(animate);
  }
  animate();
}

interface Command {
  draw(scale: number): void;
  reset(cx: number, cy: number): void;
  update(scale: number): void;
}

class DrawGridCommand implements Command {
  protected canvasCenterX: number;
  protected canvasCenterY: number;
  protected scalesIndex: number = 45;
  protected scales: number[] = [];
  protected scaledStep: number;
  protected n: number = 15;
  protected labelsPadding: number = 16;
  constructor(
    protected canvas: HTMLCanvasElement,
    protected ctx: CanvasRenderingContext2D,
    public step: number
  ) {
    this.canvasCenterX = Math.round(this.canvas.width / 2);
    this.canvasCenterY = Math.round(this.canvas.height / 2);
    this.scaledStep = this.step;

    const scaleFactors = [1, 2, 5];
    for (let i = -this.n; i <= this.n; ++i) {
      let j = 0;
      while (j < scaleFactors.length) {
        this.scales.push(scaleFactors[j] * 10 ** i);
        j++;
      }
    }
    console.log(this.scales);
  }

  draw(): void {
    this.ctx.save();
    this.ctx.strokeStyle = CSS_VARIABLES.borderLowest;
    this.ctx.lineWidth = 0.5;

    let count: number = 1;

    for (
      let x = -this.scaledStep;
      x > -this.canvasCenterX;
      x -= this.scaledStep
    ) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY);
        this.ctx.lineTo(x, this.canvasCenterY);
        this.ctx.stroke();
        this.ctx.fillText(
          `-${count * this.scales[this.scalesIndex]}`,
          x,
          +this.labelsPadding
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY);
        this.ctx.lineTo(x, this.canvasCenterY);
        this.ctx.stroke();
      }

      count++;
    }

    count = 1;
    for (
      let x = this.scaledStep;
      x < this.canvasCenterX;
      x += this.scaledStep
    ) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY);
        this.ctx.lineTo(x, this.canvasCenterY);
        this.ctx.stroke();
        this.ctx.fillText(
          `${count * this.scales[this.scalesIndex]}`,
          x,
          +this.labelsPadding
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY);
        this.ctx.lineTo(x, this.canvasCenterY);
        this.ctx.stroke();
      }

      count++;
    }

    //center

    this.ctx.fillText(`0`, -this.labelsPadding, this.labelsPadding);

    count = 1;
    for (
      let y = -this.scaledStep;
      y > -this.canvasCenterY;
      y -= this.scaledStep
    ) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX, y);
        this.ctx.lineTo(this.canvasCenterX, y);
        this.ctx.stroke();
        this.ctx.fillText(
          `${count * this.scales[this.scalesIndex]}`,
          -this.labelsPadding,
          y
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX, y);
        this.ctx.lineTo(this.canvasCenterX, y);
        this.ctx.stroke();
      }

      count++;
    }

    count = 1;
    for (
      let y = this.scaledStep;
      y < this.canvasCenterY;
      y += this.scaledStep
    ) {
      if (count % 5 === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX, y);
        this.ctx.lineTo(this.canvasCenterX, y);
        this.ctx.stroke();
        this.ctx.fillText(
          `-${count * this.scales[this.scalesIndex]}`,
          -this.labelsPadding,
          y
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX, y);
        this.ctx.lineTo(this.canvasCenterX, y);
        this.ctx.stroke();
      }

      count++;
    }

    this.ctx.restore();
  }

  reset(cx: number, cy: number): void {
    this.canvasCenterX = cx;
    this.canvasCenterY = cy;
  }

  update(scale: number): void {
    this.scaledStep = this.step * scale;
    // zoom in
    if (scale > 1.8) {
      this.scaledStep = this.step;
      this.scalesIndex -= 1;
    }

    //zoom out
    if (scale < 0.6) {
      this.scaledStep = this.step;
      this.scalesIndex += 1;
    }

    Number().toExponential();
    console.log(this.scalesIndex);
  }
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
  draw(scale: number) {
    this.ctx.save();

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

    this.ctx.restore();
  }

  reset(cx: number, cy: number): void {
    this.canvasCenterX = cx;
    this.canvasCenterY = cy;
  }

  update(): void {}
}

class Graph {
  protected dpr: number;
  protected commands: Command[];
  protected canvasCenterX!: number;
  protected canvasCenterY!: number;
  protected scale: number = 1;
  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
    ...commands: Command[]
  ) {
    this.commands = commands;
    this.dpr = window.devicePixelRatio || 1;
    this.init();
  }

  private init() {
    // set canvas height

    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.canvasCenterX = Math.round(this.canvas.width / 2);
    this.canvasCenterY = Math.round(this.canvas.height / 2);
    this.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    // ctx settings

    this.ctx.font = `500 ${14 * this.dpr}px Inter`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // register event listeners
    this.registerEvents();
  }

  private registerEvents() {
    //scoped variables
    const scaleFactor = 1.1;
    let prevWidth: number = this.canvas.offsetWidth;
    let prevHeight: number = this.canvas.offsetHeight;

    const observer = new ResizeObserver(
      debounce(() => {
        if (
          prevWidth > this.canvas.offsetWidth + 1 ||
          prevWidth < this.canvas.offsetWidth - 1 ||
          prevHeight > this.canvas.offsetHeight + 1 ||
          prevHeight < this.canvas.offsetHeight - 1
        ) {
          this.canvas.width = this.canvas.offsetWidth * this.dpr;
          this.canvas.height = this.canvas.offsetHeight * this.dpr;
          prevWidth = this.canvas.offsetWidth;
          prevHeight = this.canvas.offsetHeight;
          this.reset();
        }
      }, 50)
    );
    observer.observe(this.canvas.parentElement!);

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.scale *= e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
        this.update();
        this.scale = this.scale > 1.8 ? 1 : this.scale < 0.6 ? 1 : this.scale;
        console.log(this.scale);
      },
      { passive: false }
    );
  }

  register(command: Command) {
    this.commands.push(command);
  }

  deregister(command: Command) {
    for (let i = 0; i < this.commands.length; ++i) {
      if (this.commands[i] === command) {
        this.commands.splice(i, 1);
      }
    }
  }

  update() {
    this.commands.forEach((command) => command.update(this.scale));
  }

  reset() {
    // reset canvas settings

    this.canvasCenterX = Math.round(this.canvas.width / 2);
    this.canvasCenterY = Math.round(this.canvas.height / 2);
    this.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    // reset ctx settings

    this.ctx.font = `500 ${16 * this.dpr}px Inter`;
    this.ctx.textAlign = "center";

    this.commands.forEach((command) => {
      command.reset(this.canvasCenterX, this.canvasCenterY);
    });
  }

  render() {
    this.commands.forEach((command) => {
      command.draw(this.scale);
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
