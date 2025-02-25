import { CSS_VARIABLES } from "../../../../data/css/variables";
import { Expression } from "../../../../lib/api/graph";
import {
  GraphCommand,
  GraphCommandController,
  MouseEventData,
} from "../../interfaces";
import { Graph } from "./graph";
import {
  bisection,
  clampNumber,
  drawRoundedRect,
  roundToNeareastMultiple,
  toScientificNotation,
} from "./utils";

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
            label = clampNumber(
              -count * scaler,
              Math.abs(this.graph.scales.exponent - 1)
            ).toString();
          } else {
            label = clampNumber(
              count * scaler,
              Math.abs(this.graph.scales.exponent - 1)
            ).toString();
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
        label = clampNumber(-count * scaler, Math.abs(exponent - 1)).toString();
      } else {
        label = clampNumber(count * scaler, Math.abs(exponent - 1)).toString();
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
    const gap = this.graph.dpr * 6;

    if (axis === "x") {
      this.graph.ctx.strokeText(labels[0], x, y);
      this.graph.ctx.fillText(labels[0], x, y);
      measuredText = this.graph.ctx.measureText(labels[0]);
      x += measuredText.width / 2 + gap;
      y -= gap;

      this.graph.ctx.strokeText(labels[1], x, y);
      this.graph.ctx.fillText(labels[1], x, y);
    } else {
      measuredText = this.graph.ctx.measureText(labels[0]);
      if (0 < this.graph.clientLeft) {
        x += measuredText.width / 2 - 4;
        this.graph.ctx.strokeText(labels[0], x, y);
        this.graph.ctx.fillText(labels[0], x, y);

        x += measuredText.width / 2 + gap;
        y -= gap;
        this.graph.ctx.strokeText(labels[1], x, y);
        this.graph.ctx.fillText(labels[1], x, y);
      } else {
        x -= measuredText.width / 2 + gap;
        this.graph.ctx.strokeText(labels[0], x, y);
        this.graph.ctx.fillText(labels[0], x, y);

        x = xStart;
        y -= gap;
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

type FnData = {
  fn: {
    param: string;
    inputIntercept: number;
    outputIntercepts: number[];
    f: (input: number) => number;
  };
  derivative: {
    criticalPoints: [number, number][];
    param: string;
    f: (input: number) => number;
  };
};

export class DrawFunctionCommand implements GraphCommand {
  public color: string;
  public hidden: boolean;
  protected tooltipCommand: DrawTooltipCommand;

  constructor(
    public graph: Graph,
    expr: Expression<"expression">,
    public data: FnData
  ) {
    this.color = expr.data.color!;
    this.hidden = expr.data.hidden!;
    this.tooltipCommand = new DrawTooltipCommand(graph, this);
    console.log(this.data);
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

      if (this.data.fn.param === "y") {
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
    const fn = this.data.fn.f;

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
    const fn = this.data.fn.f;

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

      // if (fn(i) < 0.1 && fn(i) > -0.1) {
      //   console.log(i, fn(i));
      // }

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
  margin: number;
};

type TooltipData = {
  coord: { x: number; y: number };
  val: { x: number; y: number };
};

class DrawTooltipCommand implements GraphCommand {
  protected destroyController: AbortController | null = null;
  protected _state: "idle" | "running" | "focused" = "idle";
  protected data: TooltipData = {
    coord: { x: 0, y: 0 },
    val: { x: 0, y: 0 },
  };
  protected boundHandleMouseDown: ReturnType<typeof this.handleMouseDown.bind>;
  protected settings: TooltipSettings;
  constructor(
    public graph: Graph,
    public functionCommand: DrawFunctionCommand
  ) {
    this.settings = {
      textHeight: this.graph.dpr * 18,
      padding: this.graph.dpr * 16,
      shadowColor: CSS_VARIABLES.shadowLevel2,
      shadowBlur: 8,
      pointRadius: this.graph.dpr * 4,
      font: `400 ${this.graph.dpr * 18}px Inter`,
      borderRadius: this.graph.dpr * 4,
      margin: this.graph.dpr * 8,
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

    if (this.functionCommand.data.fn.param === "y") {
      const { x, y } = this.calculateValues(e, "y");

      const tolerance = 0.25 * this.graph.scales.scaler;
      const offset = Math.abs(x) - Math.abs(e.graphX);

      if (offset < tolerance && offset > -tolerance) {
        e.preventDefault(
          `Calling from function of Y because ${tolerance} > ${offset} > ${-tolerance} `
        );

        this.setData(x, y);
        this.setState("running");
      }
    } else {
      const { x, y } = this.calculateValues(e, "x");

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

  private calculateValues<T extends "x" | "y">(
    e: T extends "x"
      ? { graphX: number; graphY?: number }
      : { graphY: number; graphX?: number },
    fnName: T
  ): { x: number; y: number } {
    const maxFractionDigits = 7;
    const precision = 2 - this.graph.scales.exponent;
    let x: number = e["graphX"]! ? e["graphX"]! : 0;
    let y: number = -e["graphY"]! ? -e["graphY"]! : 0;

    if (fnName === "y") {
      if (precision <= 0) {
        y = roundToNeareastMultiple(y, 10, this.graph.scales.exponent - 2);
        x = this.functionCommand.data.fn.f(y);
        x = roundToNeareastMultiple(x, 10, this.graph.scales.exponent - 2);
      } else if (precision > 0 && precision < 7) {
        y = clampNumber(y, precision);
        x = this.functionCommand.data.fn.f(y);
        x = clampNumber(x, maxFractionDigits);
      } else {
        y = clampNumber(y, precision);
        x = this.functionCommand.data.fn.f(y);
      }
    } else {
      const fn = this.functionCommand.data.fn.f;

      if (precision <= 0) {
        x = roundToNeareastMultiple(x, 10, this.graph.scales.exponent - 2);
        y = fn(x);
        y = roundToNeareastMultiple(y, 10, this.graph.scales.exponent - 2);
      } else if (precision > 0 && precision < 7) {
        x = clampNumber(x, precision);
        y = fn(x);
        y = clampNumber(y, maxFractionDigits);
      } else {
        x = clampNumber(x, precision);
        y = fn(x);
      }
    }
    return { x, y };
  }

  private setData(x: number, y: number) {
    this.data.val.x = x;
    this.data.val.y = y;

    this.data.coord.x =
      (x * this.graph.scales.scaledStep) / this.graph.scales.scaler;
    this.data.coord.y =
      (-y * this.graph.scales.scaledStep) / this.graph.scales.scaler;
  }

  private calculateCriticalPointsX() {
    this.functionCommand.data.fn.outputIntercepts = [];
    this.functionCommand.data.derivative.criticalPoints = [];

    const fn = this.functionCommand.data.fn.f;
    const df = this.functionCommand.data.derivative.f;

    // approaching from the left side
    const leftTiles =
      (this.graph.clientLeft || 0.01) / this.graph.scales.scaledStep;
    const minX = leftTiles * this.graph.scales.scaler;

    // // approaching from the right side
    const rightTiles =
      (this.graph.clientRight || -0.01) / this.graph.scales.scaledStep;
    const maxX = rightTiles * this.graph.scales.scaler;

    let prevDY: number | undefined;
    let prevY: number | undefined;
    const nextStep: number = 0.01 * this.graph.scales.scaler;

    for (let i = minX; i < maxX; i += nextStep) {
      const y = fn(i);
      const dy = df(i);

      if (
        typeof prevY === "number" &&
        ((prevY < 0 && y > 0) || (prevY > 0 && y < 0))
      ) {
        // console.log(prevY, y);
        const root = bisection(i - nextStep, i, fn);
        root ? this.functionCommand.data.fn.outputIntercepts.push(root) : null;
      }
      if (
        typeof prevDY === "number" &&
        ((prevDY < 0 && dy > 0) || (prevDY > 0 && dy < 0))
      ) {
        const root = bisection(i - nextStep, i, df);
        root
          ? this.functionCommand.data.derivative.criticalPoints.push([
              root,
              fn(root),
            ])
          : null;
      }

      prevY = y;
      prevDY = dy;
    }

    console.log(
      this.functionCommand.data.fn.outputIntercepts,
      this.functionCommand.data.derivative.criticalPoints
    );
  }

  focus() {
    this.calculateCriticalPointsX();
  }

  run() {
    this.graph.canvas.addEventListener(
      "mousemove",
      (e) => {
        if (this.state !== "running") return;

        if (this.functionCommand.data.fn.param === "y") {
          const yTiles =
            (e.offsetY * this.graph.dpr -
              (this.graph.canvasCenterY + this.graph.offsetY)) /
            this.graph.scales.scaledStep;
          const graphY = yTiles * this.graph.scales.scaler;

          const { x, y } = this.calculateValues({ graphY }, "y");

          this.setData(x, y);
        } else {
          const xTiles =
            (e.offsetX * this.graph.dpr -
              (this.graph.canvasCenterX + this.graph.offsetX)) /
            this.graph.scales.scaledStep;
          const graphX = xTiles * this.graph.scales.scaler;

          const { x, y } = this.calculateValues({ graphX }, "x");

          this.setData(x, y);
        }
      },
      { signal: this.destroyController!.signal }
    );
    window.addEventListener(
      "mouseup",
      (e) => {
        this.setState("focused");
      },
      { signal: this.destroyController!.signal }
    );
  }

  draw(): void {
    if (this.state === "running") {
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

      // Tooltip
      this.drawTooltip();
    } else if (this.state === "focused") {
      this.graph.ctx.beginPath();
      if (this.functionCommand.data.fn.param === "y") {
        this.graph.ctx.arc(
          10,
          this.data.coord.y,
          this.settings.pointRadius,
          0,
          Math.PI * 2
        );
      } else {
        this.graph.ctx.arc(
          0,
          (-this.functionCommand.data.fn.inputIntercept *
            this.graph.scales.scaledStep) /
            this.graph.scales.scaler,
          this.settings.pointRadius,
          0,
          Math.PI * 2
        );
        this.graph.ctx.fill();

        const xIntercepts = this.functionCommand.data.fn.outputIntercepts;
        for (let i = 0; i < xIntercepts.length; i++) {
          this.graph.ctx.beginPath();
          this.graph.ctx.arc(
            (xIntercepts[i] * this.graph.scales.scaledStep) /
              this.graph.scales.scaler,
            0,
            this.settings.pointRadius,
            0,
            Math.PI * 2
          );
          this.graph.ctx.fill();
        }

        const criticalPoints =
          this.functionCommand.data.derivative.criticalPoints;
        for (let i = 0; i < criticalPoints.length; i++) {
          this.graph.ctx.beginPath();
          this.graph.ctx.arc(
            (criticalPoints[i][0] * this.graph.scales.scaledStep) /
              this.graph.scales.scaler,
            (-criticalPoints[i][1] * this.graph.scales.scaledStep) /
              this.graph.scales.scaler,
            this.settings.pointRadius,
            0,
            Math.PI * 2
          );
          this.graph.ctx.fill();
        }
      }
    }
  }

  createTooltipText() {
    if (this.graph.scales.scaler < 1e-5 || this.graph.scales.scaler > 2e4) {
      const x = toScientificNotation(this.data.val.x, 2);
      const y = toScientificNotation(this.data.val.y, 2);
      return {
        x,
        y,
      };
    } else {
      return `(${this.data.val.x}, ${this.data.val.y})`;
    }
  }

  getTooltipCoord(textWidth: number) {
    const pointX = this.data.coord.x;
    const pointY = this.data.coord.y;
    const margin = this.settings.margin;
    const height = this.settings.textHeight;

    let tooltipX: number = 0;
    let tooltipY: number = 0;
    let tooltipW: number = textWidth + this.settings.padding;
    let tooltipH: number = height + this.settings.padding;

    //default postion TopLeft

    const tooltipLeft = pointX - margin - tooltipW;
    const tooltipTop = pointY - margin - tooltipH;

    if (
      tooltipLeft > this.graph.clientLeft &&
      tooltipTop > this.graph.clientTop
    ) {
      tooltipX = tooltipLeft;
      tooltipY = pointY - margin - tooltipH;
    } else if (
      tooltipLeft > this.graph.clientLeft &&
      tooltipTop < this.graph.clientTop
    ) {
      tooltipX = tooltipLeft;
      tooltipY = pointY + margin;
    } else if (
      tooltipLeft < this.graph.clientLeft &&
      tooltipTop > this.graph.clientTop
    ) {
      tooltipX = pointX + margin;
      tooltipY = pointY - margin - tooltipH;
    } else if (
      tooltipLeft < this.graph.clientLeft &&
      tooltipTop < this.graph.clientTop
    ) {
      tooltipX = pointX + margin;
      tooltipY = pointY + margin;
    }

    return { tooltipX, tooltipY, tooltipW, tooltipH };
  }

  drawTooltip() {
    this.graph.ctx.font = this.settings.font;
    this.graph.ctx.textAlign = "start";

    let tooltipText = this.createTooltipText();
    if (typeof tooltipText === "object") {
      const textX = `(${tooltipText.x[0]}`;
      const textMetricsX = this.graph.ctx.measureText(textX);
      const textMetricsExpX = this.graph.ctx.measureText(tooltipText.x[1]);

      const textY = `, ${tooltipText.y[0]}`;
      const textMetricsY = this.graph.ctx.measureText(textY);
      const textMetricsExpY = this.graph.ctx.measureText(tooltipText.y[1]);

      const endParenthesis = ")";
      const endParenthesisMetrics = this.graph.ctx.measureText(endParenthesis);

      const totalMetricsWidth =
        textMetricsX.width +
        textMetricsExpX.width +
        textMetricsY.width +
        textMetricsExpY.width +
        endParenthesisMetrics.width;

      const { tooltipX, tooltipY, tooltipW, tooltipH } =
        this.getTooltipCoord(totalMetricsWidth);

      this.graph.ctx.save();
      this.graph.ctx.fillStyle = "white";
      this.graph.ctx.shadowColor = this.settings.shadowColor;
      this.graph.ctx.shadowBlur = this.settings.shadowBlur;

      drawRoundedRect(
        this.graph.ctx,
        tooltipX,
        tooltipY,
        tooltipW,
        tooltipH,
        this.settings.borderRadius
      );
      this.graph.ctx.fill();
      this.graph.ctx.restore();

      this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceHeading;

      let curX = tooltipX + this.settings.padding / 2;
      const y = tooltipY + tooltipH / 2;

      this.graph.ctx.fillText(textX, curX, y);
      curX += textMetricsX.width;
      this.graph.ctx.fillText(tooltipText.x[1], curX, y - this.graph.dpr * 4);
      curX += textMetricsExpX.width;
      this.graph.ctx.fillText(textY, curX, y);
      curX += textMetricsY.width;
      this.graph.ctx.fillText(tooltipText.y[1], curX, y - this.graph.dpr * 4);
      curX += textMetricsExpY.width;
      this.graph.ctx.fillText(endParenthesis, curX, y);
    } else {
      const textMetrics = this.graph.ctx.measureText(tooltipText);

      const { tooltipX, tooltipY, tooltipH, tooltipW } = this.getTooltipCoord(
        textMetrics.width
      );

      this.graph.ctx.save();
      this.graph.ctx.fillStyle = "white";
      this.graph.ctx.shadowColor = this.settings.shadowColor;
      this.graph.ctx.shadowBlur = this.settings.shadowBlur;

      drawRoundedRect(
        this.graph.ctx,
        tooltipX,
        tooltipY,
        tooltipW,
        tooltipH,
        this.settings.borderRadius
      );
      this.graph.ctx.fill();
      this.graph.ctx.restore();

      this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceHeading;
      this.graph.ctx.fillText(
        tooltipText,
        tooltipX + this.settings.padding / 2,
        tooltipY + tooltipH / 2
      );
    }
  }

  destroy(): void {
    this.destroyController?.abort();
    this.graph.removeListener("mouseDown", this.boundHandleMouseDown);
  }
}
