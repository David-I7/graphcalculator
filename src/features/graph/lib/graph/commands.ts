import { CSS_VARIABLES } from "../../../../data/css/variables";
import { Expression } from "../../../../lib/api/graph";
import {
  GraphCommand,
  GraphCommandController,
  MouseEventData,
} from "../../interfaces";
import { Graph } from "./graph";
import { drawRoundedRect } from "./utils";

type DrawData = {
  scaledStep: number;
  scaler: number;
  majorGridLine: number;
  scientificNotation: string[];
};

export class CommandController implements GraphCommandController {
  public commands: GraphCommand[] = [];
  constructor() {}

  remove(command: GraphCommand): void {
    for (let i = 0; i < this.commands.length; ++i) {
      if (this.commands[i] === command) {
        this.commands.splice(i, 1);
        break;
      }
    }
  }

  add(command: GraphCommand): void {
    this.commands.push(command);
  }

  render() {
    this.commands.forEach((command) => {
      command.draw();
    });
  }

  clear(graph: Graph): void {
    graph.ctx.clearRect(
      -graph.canvasCenterX - graph.offsetX,
      -graph.canvasCenterY - graph.offsetY,
      graph.canvas.width,
      graph.canvas.height
    );
  }
}

export class DrawGridCommand implements GraphCommand {
  protected labelsPadding: number = 14;
  constructor(public graph: Graph) {}
  draw(): void {
    this.graph.ctx.save();
    this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLowest;
    this.graph.ctx.lineWidth = 0.5;

    const scaledStep = this.graph.scales.scaledStep;
    const scaler: number = this.graph.scales.scaler;
    const majorGridLine = this.graph.scales.majorGridLine;
    const scientificNotation = this.graph.scales.getRawScaler().split("e");
    const drawData = {
      scaler,
      majorGridLine,
      scientificNotation,
      scaledStep,
    };

    this.drawVerticalLeft(drawData);
    this.drawVerticalRight(drawData);

    //center

    this.graph.ctx.fillText(`0`, -this.labelsPadding, this.labelsPadding);

    this.drawHorizontalTop();
    this.drawHorizontalBottom(drawData);

    this.graph.ctx.restore();
  }

  drawHorizontalTop() {
    if (this.graph.clientTop > 0) return;

    let count: number = 1;
    let y = -this.graph.scales.scaledStep;

    // reduce unnecessary computations

    if (this.graph.clientBottom < 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientBottom) / this.graph.scales.scaledStep
      );
      y = -this.graph.scales.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (y; y > this.graph.clientTop; y -= this.graph.scales.scaledStep) {
      if (count % this.graph.scales.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(count, "pos");

        // sticky labels

        if (Array.isArray(label)) {
          this.renderScientificLabel(label, "y", y);
        } else {
          this.renderLabel(label, "y", y);
        }
        this.graph.ctx.restore();
      } else {
        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();
      }

      count++;
    }
  }

  drawHorizontalBottom(data: DrawData) {
    if (this.graph.clientBottom < 0) return;

    let count: number = 1;
    let y = this.graph.scales.scaledStep;

    // // reduce unnecessary computations

    if (this.graph.clientTop > 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientTop) / this.graph.scales.scaledStep
      );
      y = this.graph.scales.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (y; y < this.graph.clientBottom; y += this.graph.scales.scaledStep) {
      if (count % this.graph.scales.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(count, "neg");

        // sticky labels

        if (Array.isArray(label)) {
          this.renderScientificLabel(label, "y", y);
        } else {
          this.renderLabel(label, "y", y);
        }

        this.graph.ctx.restore();
      } else {
        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();
      }

      count++;
    }
  }

  drawVerticalLeft(data: DrawData) {
    if (this.graph.clientLeft > 0) return;

    let count: number = 1;
    let x = -this.graph.scales.scaledStep;

    // // reduce unnecessary computations

    if (this.graph.clientRight < 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientRight) / this.graph.scales.scaledStep
      );
      x = -this.graph.scales.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (x; x > this.graph.clientLeft; x -= this.graph.scales.scaledStep) {
      if (count % this.graph.scales.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(count, "neg");

        // sticky labels

        if (Array.isArray(label)) {
          this.renderScientificLabel(label, "x", x);
        } else {
          this.renderLabel(label, "x", x);
        }

        this.graph.ctx.restore();
      } else {
        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();
      }

      count++;
    }
  }
  drawVerticalRight(data: DrawData) {
    if (this.graph.clientRight < 0) return;

    let count: number = 1;
    let x = this.graph.scales.scaledStep;

    // reduce unnecessary computations

    if (this.graph.clientLeft > 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientLeft) / this.graph.scales.scaledStep
      );
      x = this.graph.scales.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (x; x < this.graph.clientRight; x += this.graph.scales.scaledStep) {
      if (count % this.graph.scales.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(count, "pos");

        // sticky labels

        if (Array.isArray(label)) {
          this.renderScientificLabel(label, "x", x);
        } else {
          this.renderLabel(label, "x", x);
        }

        this.graph.ctx.restore();
      } else {
        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();
      }

      count++;
    }
  }

  generateLabel(count: number, sign: "neg" | "pos"): string | string[] {
    if (count === 0) return "";

    let label: string = "";
    const scaler = this.graph.scales.scaler;
    const scalerCoefficient = this.graph.scales.coefficient;
    let exponent = this.graph.scales.exponent;

    // 5 * 10^5 is min
    if (scaler < 1e-5 || scaler > 2e4) {
      const labels: string[] = [];
      let labelCoefficient = count * this.graph.scales.coefficient;
      let labelCoefficientPower: number = 1;

      if (labelCoefficient >= 10) {
        labelCoefficientPower = Math.floor(Math.log10(labelCoefficient));
        const labelCoefficientOffset =
          labelCoefficient / 10 ** labelCoefficientPower;

        exponent += labelCoefficientPower;
        labelCoefficient = labelCoefficientOffset;
      }

      if (exponent >= -4 && exponent < 3) {
        // sign is negative if exponent is negative
        if (scaler < 0.1) {
          if (sign === "neg") {
            label = `-${(count * scaler).toFixed(
              Math.abs(exponent) - (scalerCoefficient === 1 ? 0 : 1)
            )}`;
          } else {
            label = `${(count * scaler).toFixed(
              Math.abs(exponent) - (scalerCoefficient === 1 ? 0 : 1)
            )}`;
          }
        } else {
          if (sign === "neg") {
            label = `-${count * scaler}`;
          } else {
            label = `${count * scaler}`;
          }
        }
        return label;
      }

      labels[0] = `${
        Number.isInteger(labelCoefficient)
          ? labelCoefficient.toString()
          : labelCoefficient.toFixed(
              labelCoefficientPower - (scalerCoefficient === 1 ? 0 : 1)
            )
      } x 10`;
      labels[1] = exponent.toString();

      if (sign === "neg") {
        labels[0] = "-" + labels[0];
      }

      return labels;
    }

    if (scaler < 0.1) {
      if (sign === "neg") {
        label = `-${(count * scaler).toFixed(
          Math.abs(exponent) - (scalerCoefficient === 1 ? 0 : 1)
        )}`;
      } else {
        label = `${(count * scaler).toFixed(
          Math.abs(exponent) - (scalerCoefficient === 1 ? 0 : 1)
        )}`;
      }
    } else {
      if (sign === "neg") {
        label = `-${count * scaler}`;
      } else {
        label = `${count * scaler}`;
      }
    }

    return label;
  }

  renderLabel(label: string, axis: "x" | "y", coord: number) {
    this.graph.ctx.strokeStyle = "white";
    this.graph.ctx.lineWidth = 4;

    if (axis === "y") {
      const textMetrics = this.graph.ctx.measureText(label);
      if (0 < this.graph.clientLeft) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.graph.ctx.strokeText(
          label,
          this.graph.clientLeft + textMetrics.width / 2 + this.labelsPadding,
          coord
        );
        this.graph.ctx.fillText(
          label,
          this.graph.clientLeft + textMetrics.width / 2 + this.labelsPadding,
          coord
        );
      } else if (0 > this.graph.clientRight) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.graph.ctx.strokeText(
          label,
          this.graph.clientRight - this.labelsPadding - textMetrics.width / 2,
          coord
        );
        this.graph.ctx.fillText(
          label,
          this.graph.clientRight - this.labelsPadding - textMetrics.width / 2,
          coord
        );
      } else {
        this.graph.ctx.strokeText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          coord
        );
        this.graph.ctx.fillText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          coord
        );
      }
    } else {
      if (0 < this.graph.clientTop) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.graph.ctx.strokeText(
          label,
          coord,
          this.graph.clientTop + this.labelsPadding
        );
        this.graph.ctx.fillText(
          label,
          coord,
          this.graph.clientTop + this.labelsPadding
        );
      } else if (0 > this.graph.clientBottom) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.graph.ctx.strokeText(
          label,
          coord,
          this.graph.clientBottom - this.labelsPadding
        );
        this.graph.ctx.fillText(
          label,
          coord,
          this.graph.clientBottom - this.labelsPadding
        );
      } else {
        this.graph.ctx.strokeText(label, coord, this.labelsPadding);
        this.graph.ctx.fillText(label, coord, this.labelsPadding);
      }
    }
  }

  renderScientificLabel(labels: string[], axis: "x" | "y", coord: number) {
    this.graph.ctx.strokeStyle = "white";
    this.graph.ctx.lineWidth = 4;

    if (axis === "y") {
      if (0 < this.graph.clientLeft) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.drawScientificLabel(
          labels,
          "y",
          this.graph.clientLeft + this.labelsPadding,
          coord
        );
      } else if (0 > this.graph.clientRight) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.drawScientificLabel(
          labels,
          "y",
          this.graph.clientRight - this.labelsPadding,
          coord
        );
      } else {
        this.drawScientificLabel(labels, "y", -this.labelsPadding, coord);
      }
    } else {
      if (0 < this.graph.clientTop) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.drawScientificLabel(
          labels,
          "x",
          coord,
          this.graph.clientTop + this.labelsPadding * 1.5
        );
      } else if (0 > this.graph.clientBottom) {
        this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
        this.drawScientificLabel(
          labels,
          "x",
          coord,
          this.graph.clientBottom - this.labelsPadding * 1.5
        );
      } else {
        this.drawScientificLabel(labels, "x", coord, this.labelsPadding * 1.5);
      }
    }
  }
  drawScientificLabel(
    labels: string[],
    axis: "x" | "y",
    xStart: number,
    yStart: number
  ) {
    let x: number = xStart;
    let y: number = yStart;
    let measuredText!: TextMetrics;

    if (axis === "x") {
      this.graph.ctx.strokeText(labels[0], x, y);
      this.graph.ctx.fillText(labels[0], x, y);
      measuredText = this.graph.ctx.measureText(labels[0]);
      x += measuredText.width / 2 + 8;
      y -= 8;

      this.graph.ctx.strokeText(labels[1], x, y);
      this.graph.ctx.fillText(labels[1], x, y);
    } else {
      measuredText = this.graph.ctx.measureText(labels[0]);
      if (0 < this.graph.clientLeft) {
        x += measuredText.width / 2 - 4;
        this.graph.ctx.strokeText(labels[0], x, y);
        this.graph.ctx.fillText(labels[0], x, y);

        x += measuredText.width / 2 + 8;
        y -= 8;
        this.graph.ctx.strokeText(labels[1], x, y);
        this.graph.ctx.fillText(labels[1], x, y);
      } else {
        x -= measuredText.width / 2 + 8;
        this.graph.ctx.strokeText(labels[0], x, y);
        this.graph.ctx.fillText(labels[0], x, y);

        x = xStart;
        y -= 8;
        this.graph.ctx.strokeText(labels[1], x, y);
        this.graph.ctx.fillText(labels[1], x, y);
      }
    }
  }
}

export class DrawAxisCommand implements GraphCommand {
  constructor(public graph: Graph) {}
  draw() {
    if (
      (0 > this.graph.canvasCenterX - this.graph.offsetX ||
        0 < -this.graph.canvasCenterX - this.graph.offsetX) &&
      (0 > this.graph.canvasCenterY - this.graph.offsetY ||
        0 < -this.graph.canvasCenterY - this.graph.offsetY)
    )
      return;

    this.graph.ctx.save();

    this.graph.ctx.strokeStyle = CSS_VARIABLES.borderHigh;
    this.graph.ctx.fillStyle = CSS_VARIABLES.borderHigh;
    this.graph.ctx.lineWidth = 2;

    // y axis
    if (
      !(
        0 > this.graph.canvasCenterX - this.graph.offsetX ||
        0 < -this.graph.canvasCenterX - this.graph.offsetX
      )
    ) {
      this.graph.ctx.beginPath();
      this.graph.ctx.moveTo(0, -this.graph.canvasCenterY - this.graph.offsetY);
      this.graph.ctx.lineTo(
        -6,
        -this.graph.canvasCenterY - this.graph.offsetY + 10
      );
      this.graph.ctx.lineTo(
        +6,
        -this.graph.canvasCenterY - this.graph.offsetY + 10
      );
      this.graph.ctx.closePath();
      this.graph.ctx.fill();

      this.graph.ctx.lineTo(0, this.graph.canvasCenterY - this.graph.offsetY);
      this.graph.ctx.stroke();
    }

    // x axis
    if (
      !(
        0 > this.graph.canvasCenterY - this.graph.offsetY ||
        0 < -this.graph.canvasCenterY - this.graph.offsetY
      )
    ) {
      this.graph.ctx.beginPath();
      this.graph.ctx.moveTo(this.graph.canvasCenterX - this.graph.offsetX, 0);
      this.graph.ctx.lineTo(
        this.graph.canvasCenterX - this.graph.offsetX - 10,
        -6
      );
      this.graph.ctx.lineTo(
        this.graph.canvasCenterX - this.graph.offsetX - 10,
        +6
      );
      this.graph.ctx.closePath();
      this.graph.ctx.fill();

      this.graph.ctx.lineTo(-this.graph.canvasCenterX - this.graph.offsetX, 0);
      this.graph.ctx.stroke();
    }

    this.graph.ctx.restore();
  }
}

export class DrawFunctionCommand implements GraphCommand {
  public color: string;
  public hidden: boolean;
  protected tooltipCommand: DrawTooltipCommand;

  constructor(
    public graph: Graph,
    expr: Expression<"expression">,
    public fn: Record<string, (input: number) => number>
  ) {
    this.color = expr.data.color!;
    this.hidden = expr.data.hidden!;
    this.tooltipCommand = new DrawTooltipCommand(graph, this);
  }

  draw(): void {
    if (this.hidden) return;

    try {
      this.graph.ctx.save();

      this.graph.ctx.strokeStyle = this.color;
      this.graph.ctx.fillStyle = this.color;
      this.graph.ctx.lineWidth = 2 * this.graph.dpr;

      // for tooltip
      // 1 box = 1 tile
      // x = 1 tile * scaler

      if (this.fn["y"]) {
        this.drawFunctionOfY();
      } else {
        this.drawFunctionOfX();
      }

      if (!(this.tooltipCommand.state === "idle")) {
        this.tooltipCommand.draw();
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.graph.ctx.restore();
    }
  }

  drawFunctionOfY() {
    const fn = this.fn["y"];

    // approaching from the left side
    const topTiles =
      (this.graph.clientTop || 0.01) / this.graph.scales.scaledStep;
    const minY = topTiles * this.graph.scales.scaler;

    // // approaching from the right side
    const bottomTiles =
      (this.graph.clientBottom || -0.01) / this.graph.scales.scaledStep;
    const maxY = bottomTiles * this.graph.scales.scaler;

    let nextX: number | undefined;
    let nextY: number | undefined;
    const nextStep = 0.01 * this.graph.scales.scaler;

    for (let y = minY; y < maxY; y += nextStep) {
      this.graph.ctx.beginPath();
      const curY =
        nextY ?? y * (this.graph.scales.scaledStep / this.graph.scales.scaler);
      const curX =
        nextX ??
        (fn(-y) * this.graph.scales.scaledStep) / this.graph.scales.scaler;
      if (isNaN(curX)) continue;

      nextY =
        (y + nextStep) *
        (this.graph.scales.scaledStep / this.graph.scales.scaler);
      nextX =
        (fn(-y + nextStep) * this.graph.scales.scaledStep) /
        this.graph.scales.scaler;
      if (isNaN(nextX)) continue;

      this.graph.ctx.moveTo(curX, curY);
      this.graph.ctx.lineTo(nextX, nextY);
      this.graph.ctx.stroke();
    }
  }

  drawFunctionOfX() {
    const fn = Object.values(this.fn)[0];

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

    for (let i = minX; i < maxX; i += nextStep) {
      this.graph.ctx.beginPath();
      const curX =
        nextX ?? i * (this.graph.scales.scaledStep / this.graph.scales.scaler);
      const curY =
        nextY ??
        -(
          (fn(i + nextStep) / this.graph.scales.scaler) *
          this.graph.scales.scaledStep
        );
      if (isNaN(curY)) continue;

      nextX =
        (i + nextStep) *
        (this.graph.scales.scaledStep / this.graph.scales.scaler);

      nextY = -(
        (fn(i + nextStep) / this.graph.scales.scaler) *
        this.graph.scales.scaledStep
      );
      if (isNaN(nextY)) continue;

      this.graph.ctx.moveTo(curX, curY);
      this.graph.ctx.lineTo(nextX, nextY);
      this.graph.ctx.stroke();
    }
  }

  destroy(): void {
    this.tooltipCommand.destroy();
  }
}

//focused state => expression list is focused
// and chart is focused showing major points such as
// x and y intercepts, relative and absolute minimas/maximas

// running state => move move listener, show tooltip coordinates

// idle state => draw() will not be called.

type TooltipSettings = {
  textHeight: number;
  padding: number;
  shadowColor: string;
  shadowBlur: number;
  pointRadius: number;
  font: string;
  borderRadius: number;
};

type TooltipData = {
  coord: { x: number; y: number };
  val: { x: number; y: number };
};

class DrawTooltipCommand implements GraphCommand {
  protected destroyController: AbortController | null = null;
  protected _state: "idle" | "running" | "focused" = "idle";
  protected data: TooltipData = { coord: { x: 0, y: 0 }, val: { x: 0, y: 0 } };
  protected boundHandleMouseDown: ReturnType<typeof this.handleMouseDown.bind>;
  protected settings: TooltipSettings;
  constructor(
    public graph: Graph,
    public functionCommand: DrawFunctionCommand
  ) {
    this.settings = {
      textHeight: this.graph.dpr * 18,
      padding: this.graph.dpr * 16,
      shadowColor: CSS_VARIABLES.shadowLevel1,
      shadowBlur: 8,
      pointRadius: this.graph.dpr * 4,
      font: `400 ${this.graph.dpr * 18}px Inter`,
      borderRadius: this.graph.dpr * 4,
    };
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.graph.on("mouseDown", this.boundHandleMouseDown);
  }

  setState<T extends typeof this._state>(state: T) {
    this._state = state;
    if (state === "idle") {
      this.destroyController!.abort();
      this.destroyController = null;
    } else if (state === "focused") {
      this.focus();
    } else {
      state;
      if (this.destroyController) this.destroyController.abort();
      this.destroyController = new AbortController();
      this.run();
    }
  }

  get state(): typeof this._state {
    return this._state;
  }

  handleMouseDown(e: MouseEventData) {
    if (this.functionCommand.hidden) return;

    if (this.functionCommand.fn["y"]) {
      const y = -e.graphY;
      const x = this.functionCommand.fn["y"](y);

      const tolerance = 0.15 * this.graph.scales.scaler;
      const offset = Math.abs(x) - Math.abs(e.graphX);

      if (offset < tolerance && offset > -tolerance) {
        e.preventDefault(
          `Calling from function of Y because ${tolerance} > ${offset} > ${-tolerance} `
        );

        this.setData(x, y);
        this.setState("running");
      }
    } else {
      const fn = Object.values(this.functionCommand.fn)[0];

      const x = e.graphX;
      const y = fn(x);

      const tolerance = 0.25 * this.graph.scales.scaler;
      const offset = Math.abs(y) - Math.abs(e.graphY);

      if (offset < tolerance && offset > -tolerance) {
        e.preventDefault(
          `Calling from function of X because ${tolerance} > ${offset} > ${-tolerance} `
        );

        this.setData(x, y);
        this.setState("running");
      }
    }
  }

  setData(x: number, y: number) {
    this.data.val.x = x;
    this.data.val.y = y;

    this.data.coord.x =
      (x * this.graph.scales.scaledStep) / this.graph.scales.scaler;
    this.data.coord.y =
      (-y * this.graph.scales.scaledStep) / this.graph.scales.scaler;
  }

  focus() {
    // calc critical points
  }

  run() {
    this.graph.canvas.addEventListener(
      "mousemove",
      (e) => {
        if (this.state === "idle") return;

        console.log(e.offsetY + this.graph.dpr);

        if (this.functionCommand.fn["y"]) {
          const fn = this.functionCommand.fn["y"];

          const yTiles =
            (e.offsetY * this.graph.dpr -
              (this.graph.canvasCenterY + this.graph.offsetY)) /
            this.graph.scales.scaledStep;
          const graphY = yTiles * this.graph.scales.scaler;

          const y = -graphY;
          const x = fn(y);

          const precision = 0.01 * 10 ** this.graph.scales.exponent;

          this.setData(x, y);
        } else {
          const fn = Object.values(this.functionCommand.fn)[0];

          // const dx = e.offsetX * this.graph.dpr - lastMouseX

          const xTiles =
            (e.offsetX * this.graph.dpr -
              (this.graph.canvasCenterX + this.graph.offsetX)) /
            this.graph.scales.scaledStep;
          const graphX = xTiles * this.graph.scales.scaler;

          const x = graphX;
          const y = fn(x);

          console.log(x, y);

          this.setData(x, y);
        }
      },
      { signal: this.destroyController!.signal }
    );
    window.addEventListener(
      "mouseup",
      (e) => {
        this.setState("idle");
      },
      { signal: this.destroyController!.signal }
    );
  }

  draw(): void {
    // Point

    this.graph.ctx.beginPath();
    this.graph.ctx.arc(
      this.data.coord.x,
      this.data.coord.y,
      this.settings.pointRadius,
      0,
      Math.PI * 2
    );
    this.graph.ctx.fill();

    // Tooltip text

    const tooltipX = this.data.coord.x - 16;
    const tooltipY = this.data.coord.y - 16;

    this.graph.ctx.font = this.settings.font;

    const tooltipText = `(${this.data.val.x}, ${this.data.val.y})`;
    const textMetrics = this.graph.ctx.measureText(tooltipText);

    this.graph.ctx.save();
    this.graph.ctx.fillStyle = "white";
    this.graph.ctx.shadowColor = this.settings.shadowColor;
    this.graph.ctx.shadowBlur = this.settings.shadowBlur;

    drawRoundedRect(
      this.graph.ctx,
      tooltipX - textMetrics.width - this.settings.padding,
      tooltipY - this.settings.textHeight - this.settings.padding,
      textMetrics.width + this.settings.padding,
      this.settings.textHeight + this.settings.padding,
      this.settings.borderRadius
    );
    this.graph.ctx.fill();
    this.graph.ctx.restore();

    this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceHeading;
    this.graph.ctx.fillText(
      tooltipText,
      tooltipX - textMetrics.width / 2 - this.settings.padding / 2,
      tooltipY - this.settings.textHeight / 2 - this.settings.padding / 2
    );
  }

  destroy(): void {
    this.destroyController?.abort();
    this.graph.removeListener("mouseDown", this.boundHandleMouseDown);
  }
}
