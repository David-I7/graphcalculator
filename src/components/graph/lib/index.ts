import { debounce, throttle } from "../../../helpers/performance";
import { CSS_VARIABLES } from "../../../data/css/variables";

// NOTES

// add zooming in or out without fixing origin in place if users mouse is not pointing towards the center (given a tolerance)
// fix floating point label errors

window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  // ctx.translate(50, 50);
  // ctx.fillRect(0, 0, 50, 50);

  // setTimeout(() => {
  //   ctx.translate(-50, -50);
  //   ctx.fillRect(0, 0, 50, 50);
  // }, 1000);

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
  update(event: GraphEvent): void;
}

const GRAPH_EVENTS = ["scale", "pan"] as const;

interface GraphEvent {
  type: (typeof GRAPH_EVENTS)[number];
  payload: Record<string, any>;
}

class DrawGridCommand implements Command {
  protected canvasCenterX: number;
  protected canvasCenterY: number;
  protected offsetX: number = 0;
  protected offsetY: number = 0;
  protected scalesIndex: number = 45;
  protected scales: string[] = [];
  protected scaledStep: number;
  protected n: number = 15;
  protected labelsPadding: number = 14;
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
        this.scales.push(`${scaleFactors[j]}e${i}`);
        j++;
      }
    }
    console.log(this.scales);
  }

  draw(): void {
    this.ctx.save();
    this.ctx.strokeStyle = CSS_VARIABLES.borderLowest;
    this.ctx.lineWidth = 0.5;

    const scale: number = parseFloat(this.scales[this.scalesIndex]);
    const majorGridLine = this.scales[this.scalesIndex][0] === "5" ? 4 : 5;

    this.drawVerticalLeft(majorGridLine, scale);
    this.drawVerticalRight(majorGridLine, scale);

    //center

    this.ctx.fillText(`0`, -this.labelsPadding, this.labelsPadding);

    this.drawHorizontalTop(majorGridLine, scale);
    this.drawHorizontalBottom(majorGridLine, scale);

    this.ctx.restore();
  }

  drawHorizontalTop(majorGridLine: number, scale: number) {
    let count: number = 1;

    let y = -this.scaledStep;

    for (y; y > -this.canvasCenterY - this.offsetY; y -= this.scaledStep) {
      if (count % majorGridLine === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX - this.offsetX, y);
        this.ctx.lineTo(this.canvasCenterX - this.offsetX, y);
        this.ctx.stroke();

        // text

        const label = this.generateLabel(count, scale, "positive");

        if (0 < -this.canvasCenterX - this.offsetX) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            -this.canvasCenterX - this.offsetX + this.labelsPadding,
            y
          );
          this.ctx.restore();
          count++;
          continue;
        } else if (0 > this.canvasCenterX - this.offsetX) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            this.canvasCenterX - this.offsetX - this.labelsPadding,
            y
          );
          this.ctx.restore();
          count++;
          continue;
        }

        const textMetrics = this.ctx.measureText(label);
        this.ctx.fillText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          y
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX - this.offsetX, y);
        this.ctx.lineTo(this.canvasCenterX - this.offsetX, y);
        this.ctx.stroke();
      }

      count++;
    }
  }
  drawHorizontalBottom(majorGridLine: number, scale: number) {
    let count: number = 1;

    for (
      let y = this.scaledStep;
      y < this.canvasCenterY - this.offsetY;
      y += this.scaledStep
    ) {
      if (count % majorGridLine === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX - this.offsetX, y);
        this.ctx.lineTo(this.canvasCenterX - this.offsetX, y);
        this.ctx.stroke();

        // text

        const label = this.generateLabel(count, scale, "negative");

        if (0 < -this.canvasCenterX - this.offsetX) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            -this.canvasCenterX - this.offsetX + this.labelsPadding,
            y
          );
          this.ctx.restore();
          count++;
          continue;
        } else if (0 > this.canvasCenterX - this.offsetX) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            this.canvasCenterX - this.offsetX - this.labelsPadding,
            y
          );
          this.ctx.restore();
          count++;
          continue;
        }

        const textMetrics = this.ctx.measureText(label);
        this.ctx.fillText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          y
        );
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvasCenterX - this.offsetX, y);
        this.ctx.lineTo(this.canvasCenterX - this.offsetX, y);
        this.ctx.stroke();
      }

      count++;
    }
  }

  drawVerticalLeft(majorGridLine: number, scale: number) {
    let count: number = 1;

    for (
      let x = -this.scaledStep;
      x > -this.canvasCenterX - this.offsetX;
      x -= this.scaledStep
    ) {
      if (count % majorGridLine === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY - this.offsetY);
        this.ctx.lineTo(x, this.canvasCenterY - this.offsetY);
        this.ctx.stroke();

        // text

        const label = this.generateLabel(count, scale, "negative");

        if (0 < -this.canvasCenterY - this.offsetY) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            x,
            -this.canvasCenterY - this.offsetY + this.labelsPadding
          );
          this.ctx.restore();
          count++;
          continue;
        } else if (0 > this.canvasCenterY - this.offsetY) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            x,
            this.canvasCenterY - this.offsetY - this.labelsPadding
          );
          this.ctx.restore();
          count++;
          continue;
        }

        this.ctx.fillText(label, x, +this.labelsPadding);
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY - this.offsetY);
        this.ctx.lineTo(x, this.canvasCenterY - this.offsetY);
        this.ctx.stroke();
      }

      count++;
    }
  }
  drawVerticalRight(majorGridLine: number, scale: number) {
    let count: number = 1;

    for (
      let x = this.scaledStep;
      x < this.canvasCenterX - this.offsetX;
      x += this.scaledStep
    ) {
      if (count % majorGridLine === 0) {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY - this.offsetY);
        this.ctx.lineTo(x, this.canvasCenterY - this.offsetY);
        this.ctx.stroke();

        // text

        const label = this.generateLabel(count, scale, "positive");
        if (0 < -this.canvasCenterY - this.offsetY) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            x,
            -this.canvasCenterY - this.offsetY + this.labelsPadding
          );
          this.ctx.restore();
          count++;
          continue;
        } else if (0 > this.canvasCenterY - this.offsetY) {
          this.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.ctx.fillText(
            label,
            x,
            this.canvasCenterY - this.offsetY - this.labelsPadding
          );
          this.ctx.restore();
          count++;
          continue;
        }

        this.ctx.fillText(label, x, +this.labelsPadding);
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, -this.canvasCenterY - this.offsetY);
        this.ctx.lineTo(x, this.canvasCenterY - this.offsetY);
        this.ctx.stroke();
      }

      count++;
    }
  }

  generateLabel(
    count: number,
    scale: number,
    direction: "negative" | "positive"
  ): string {
    let label: string = "";

    if (scale < 1e-5 || scale > 1e5) {
      const scientificNotation = this.scales[this.scalesIndex].split("e");
      const humanScientificNotation = `${scientificNotation[0]} X 10^${scientificNotation[1]}`;
      if (direction === "negative") {
        label = "-" + humanScientificNotation;
      } else {
        label = humanScientificNotation;
      }
    } else {
      if (direction === "negative") {
        label = `-${count * scale}`;
      } else {
        label = `${count * scale}`;
      }
    }

    return label;
  }

  reset(cx: number, cy: number): void {
    this.canvasCenterX = cx;
    this.canvasCenterY = cy;
  }

  update(event: GraphEvent): void {
    if (event.type === "scale") {
      this.scaledStep = this.step * (event.payload.scale as unknown as number);
      // zoom in

      if ((event.payload.scale as unknown as number) > 1.8) {
        this.scaledStep = this.step * 0.7;
        this.scalesIndex -= 1;
      }

      //zoom out

      if ((event.payload.scale as unknown as number) < 0.7) {
        this.scaledStep = this.step * 1.8;
        this.scalesIndex += 1;
      }
    } else if (event.type == "pan") {
      this.offsetX = event.payload.offsetX;
      this.offsetY = event.payload.offsetY;
    }
  }
}

class DrawAxisCommand implements Command {
  protected canvasCenterX: number;
  protected canvasCenterY: number;
  protected offsetX: number = 0;
  protected offsetY: number = 0;
  constructor(
    protected canvas: HTMLCanvasElement,
    protected ctx: CanvasRenderingContext2D
  ) {
    this.canvasCenterY = Math.round(canvas.height / 2);
    this.canvasCenterX = Math.round(canvas.width / 2);
  }
  draw(scale: number) {
    if (
      (0 > this.canvasCenterX - this.offsetX ||
        0 < -this.canvasCenterX - this.offsetX) &&
      (0 > this.canvasCenterY - this.offsetY ||
        0 < -this.canvasCenterY - this.offsetY)
    )
      return;

    this.ctx.save();

    this.ctx.strokeStyle = CSS_VARIABLES.borderHigh;
    this.ctx.fillStyle = CSS_VARIABLES.borderHigh;
    this.ctx.lineWidth = 2;

    // y axis
    if (
      !(
        0 > this.canvasCenterX - this.offsetX ||
        0 < -this.canvasCenterX - this.offsetX
      )
    ) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.canvasCenterY - this.offsetY);
      this.ctx.lineTo(-6, -this.canvasCenterY - this.offsetY + 10);
      this.ctx.lineTo(+6, -this.canvasCenterY - this.offsetY + 10);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.lineTo(0, this.canvasCenterY - this.offsetY);
      this.ctx.stroke();
    }

    // x axis
    if (
      !(
        0 > this.canvasCenterY - this.offsetY ||
        0 < -this.canvasCenterY - this.offsetY
      )
    ) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvasCenterX - this.offsetX, 0);
      this.ctx.lineTo(this.canvasCenterX - this.offsetX - 10, -6);
      this.ctx.lineTo(this.canvasCenterX - this.offsetX - 10, +6);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.lineTo(-this.canvasCenterX - this.offsetX, 0);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  reset(cx: number, cy: number): void {
    this.canvasCenterX = cx;
    this.canvasCenterY = cy;
  }

  update(event: GraphEvent): void {
    if (event.type == "pan") {
      this.offsetX = event.payload.offsetX;
      this.offsetY = event.payload.offsetY;
    }
  }
}

class Graph {
  protected dpr: number;
  protected commands: Command[];
  protected canvasCenterX!: number;
  protected canvasCenterY!: number;
  protected scale: number = 1;
  protected isDragging: boolean = false;
  protected offsetX: number = 0;
  protected offsetY: number = 0;
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
    const wheelTolerance: number = 75;
    let prevWidth: number = this.canvas.offsetWidth;
    let prevHeight: number = this.canvas.offsetHeight;

    const observer = new ResizeObserver(
      throttle(() => {
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
        // console.log(e.offsetX, e.offsetY);
        const zoomDirection = e.deltaY > 0 ? "OUT" : "IN";

        const dx = e.offsetX * this.dpr - (this.canvasCenterX + this.offsetX);
        const dy = e.offsetY * this.dpr - (this.canvasCenterY + this.offsetY);

        if (Math.abs(dx) > wheelTolerance || Math.abs(dy) > wheelTolerance) {
          // console.log(this.offsetX, this.offsetY);
          // console.log(dx, dy);
          const roundedX = Math.round(dx / 10);
          const roundedY = Math.round(dy / 10);
          if (zoomDirection === "IN") {
            this.offsetX += -roundedX;
            this.offsetY += -roundedY;
            this.ctx.translate(-roundedX, -roundedY);
          } else {
            this.offsetX += roundedX;
            this.offsetY += roundedY;
            this.ctx.translate(roundedX, roundedY);
          }

          const event: GraphEvent = {
            type: "pan",
            payload: {
              offsetX: this.offsetX,
              offsetY: this.offsetY,
            },
          };
          this.dispatch(event);
        }

        this.scale *= zoomDirection === "OUT" ? 1 / scaleFactor : scaleFactor;
        const event: GraphEvent = {
          type: "scale",
          payload: {
            scale: this.scale,
          },
        };
        this.dispatch(event);
        this.scale =
          this.scale > 1.8 ? 0.7 : this.scale < 0.7 ? 1.8 : this.scale;
      },
      { passive: false }
    );

    let lastMouseX = 0;
    let lastMouseY = 0;

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    this.canvas.addEventListener(
      "mousemove",
      throttle((e) => {
        if (!this.isDragging) return;

        const dx = Math.round(e.clientX - lastMouseX);
        const dy = Math.round(e.clientY - lastMouseY);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        this.offsetX += dx;
        this.offsetY += dy;

        const event: GraphEvent = {
          type: "pan",
          payload: {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
          },
        };
        this.dispatch(event);

        this.ctx.translate(dx, dy);
      }, 10)
    );
    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
    });
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

  dispatch(event: GraphEvent) {
    this.commands.forEach((command) => command.update(event));
  }

  reset() {
    // reset canvas settings

    this.offsetX = 0;
    this.offsetY = 0;
    this.canvasCenterX = Math.round(this.canvas.width / 2);
    this.canvasCenterY = Math.round(this.canvas.height / 2);
    this.ctx.translate(this.canvasCenterX, this.canvasCenterY);
    this.dispatch({
      type: "pan",
      payload: { offsetX: this.offsetX, offsetY: this.offsetY },
    });

    // reset ctx settings

    this.ctx.font = `500 ${16 * this.dpr}px Inter`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

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
      -this.canvasCenterX - this.offsetX,
      -this.canvasCenterY - this.offsetY,
      this.canvas.width,
      this.canvas.height
    );
  }
}
