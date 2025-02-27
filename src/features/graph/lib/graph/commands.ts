import { ConstantNode, FunctionAssignmentNode } from "mathjs";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { Expression } from "../../../../lib/api/graph";
import {
  GraphCommand,
  GraphCommandController,
  MouseEventData,
} from "../../interfaces";
import { Graph } from "./graph";
import {
  binarySearchClosest,
  bisection,
  clampNumber,
  drawRoundedRect,
  newtonsMethod,
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

export type FnData = {
  f: {
    node: FunctionAssignmentNode;
    param: string;
    inputIntercept: number;
    outputIntercepts: number[];
    f: (input: number) => number;
  };
  df: {
    node: FunctionAssignmentNode;
    criticalPoints: [number, number][];
    param: string;
    f: (input: number) => number;
  };
  ddf: {
    node: FunctionAssignmentNode;
    criticalPoints: [number, number][];
    param: string;
    f: (input: number) => number;
  };
};

export type ExprData = {
  color: string;
  hidden: boolean;
  state: "focused" | "dragged" | "idle";
  onStateChange(
    prevState: ExprData["state"],
    curState: ExprData["state"]
  ): void;
};
export class DrawFunctionCommand implements GraphCommand {
  protected tooltipCommand: DrawTooltipCommand;
  settings: {
    color: string;
    hidden: boolean;
  };
  state: ExprData["state"];
  onStateChange: ExprData["onStateChange"];

  constructor(public graph: Graph, public data: FnData, exprData: ExprData) {
    this.settings = {
      color: exprData.color,
      hidden: exprData.hidden,
    };
    this.onStateChange = exprData.onStateChange;
    this.state = exprData.state;
    this.tooltipCommand = new DrawTooltipCommand(graph, this);
    console.log(this.data);
  }

  setState<T extends typeof this.state>(state: T) {
    if (state === this.state) return;
    this.onStateChange(this.state, state);
    this.state = state;
    this.tooltipCommand.syncState(state);
  }

  draw(): void {
    if (this.settings.hidden) return;

    try {
      this.graph.ctx.save();

      this.graph.ctx.strokeStyle = this.settings.color;
      this.graph.ctx.fillStyle = this.settings.color;
      this.graph.ctx.lineWidth = 2 * this.graph.dpr;

      if (this.data.f.param === "y") {
        this.drawFunctionOfY();
        if (this.state !== "idle") {
          this.calculateCriticalPointsY();
          this.tooltipCommand.draw();
        }
      } else {
        this.drawFunctionOfX();
        if (this.state !== "idle") {
          this.calculateCriticalPointsX();
          this.tooltipCommand.draw();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.graph.ctx.restore();
    }
  }

  drawFunctionOfY() {
    const f = this.data.f.f;
    const normFactor = this.graph.scales.scaledStep / this.graph.scales.scaler;

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
      const curY = nextY ?? y * normFactor;
      const curX = nextX ?? f(-y) * normFactor;
      if (isNaN(curX)) continue;

      nextY = (y + nextStep) * normFactor;
      nextX = f(-y + nextStep) * normFactor;
      if (isNaN(nextX)) continue;

      this.graph.ctx.moveTo(curX, curY);
      this.graph.ctx.lineTo(nextX, nextY);
      this.graph.ctx.stroke();
    }
  }

  drawFunctionOfX() {
    const f = this.data.f.f;
    const normFactor = this.graph.scales.scaledStep / this.graph.scales.scaler;

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
      const curX = nextX ?? i * normFactor;
      const curY = nextY ?? -(f(i + nextStep) * normFactor);
      if (isNaN(curY)) continue;

      nextX = (i + nextStep) * normFactor;
      nextY = -(f(i + nextStep) * normFactor);
      if (isNaN(nextY)) continue;

      this.graph.ctx.moveTo(curX, curY);
      this.graph.ctx.lineTo(nextX, nextY);
      this.graph.ctx.stroke();
    }
  }

  private calculateCriticalPointsX() {
    // there are no xIntercepts if the function is contant
    if (this.data.f.node.expr instanceof ConstantNode) return;

    this.data.f.outputIntercepts = [];
    this.data.df.criticalPoints = [];

    const f = this.data.f.f;
    const df = this.data.df.f;
    const ddf = this.data.ddf.f;

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
      const y = f(i);
      const dy = df(i);

      if (
        typeof prevY === "number" &&
        ((prevY < 0 && y > 0) || (prevY > 0 && y < 0))
      ) {
        const root = newtonsMethod(i, f, df);
        this.data.f.outputIntercepts.push(root);
      }

      if (
        typeof prevDY === "number" &&
        ((prevDY < 0 && dy > 0) || (prevDY > 0 && dy < 0))
      ) {
        let root!: number;

        // if df is constant ddf is 0 so we can't use
        // newtons method
        if (
          this.data.ddf.node.expr instanceof ConstantNode &&
          this.data.ddf.node.expr.value === 0
        ) {
          root = bisection(i - nextStep, i, df);
        } else {
          root = newtonsMethod(i, df, ddf);
        }
        this.data.df.criticalPoints.push([root, f(root)]);
      }
      prevY = y;
      prevDY = dy;
    }
  }
  private calculateCriticalPointsY() {
    // there are no yIntercepts if the function is contant
    if (this.data.f.node.expr instanceof ConstantNode) return;

    this.data.f.outputIntercepts = [];
    this.data.df.criticalPoints = [];

    const f = this.data.f.f;
    const df = this.data.df.f;
    const ddf = this.data.ddf.f;

    // approaching from the left side
    const topTiles =
      (this.graph.clientTop || 0.01) / this.graph.scales.scaledStep;
    // approaching from the right side
    const bottomTiles =
      (this.graph.clientBottom || -0.01) / this.graph.scales.scaledStep;

    // minY is based on actual minY, not canvas minY (graphY)
    const minY = -bottomTiles * this.graph.scales.scaler;
    const maxY = -topTiles * this.graph.scales.scaler;

    let prevX: number | undefined;
    let prevDX: number | undefined;
    const nextStep = 0.01 * this.graph.scales.scaler;

    for (let i = minY; i < maxY; i += nextStep) {
      const x = f(i);
      const dx = df(i);

      if (
        typeof prevX === "number" &&
        ((prevX < 0 && x > 0) || (prevX > 0 && x < 0))
      ) {
        const root = newtonsMethod(i, f, df);
        this.data.f.outputIntercepts.push(root);
      }

      if (
        typeof prevDX === "number" &&
        ((prevDX < 0 && dx > 0) || (prevDX > 0 && dx < 0))
      ) {
        let root!: number;
        // if df is constant ddf is 0 so we can't use
        // newtons method
        if (
          this.data.ddf.node.expr instanceof ConstantNode &&
          this.data.ddf.node.expr.value === 0
        ) {
          root = bisection(i - nextStep, i, df);
        } else {
          root = newtonsMethod(i, df, ddf);
        }
        this.data.df.criticalPoints.push([f(root), root]);
      }
      prevX = x;
      prevDX = dx;
    }
  }

  destroy(): void {
    this.tooltipCommand.destroy();
  }
}

type TooltipSettings = {
  textHeight: number;
  padding: number;
  shadowColor: string;
  shadowBlur: number;
  pointRadius: number;
  font: string;
  borderRadius: number;
  margin: number;
  maxFractionDigits: number;
};

type TooltipData = {
  coord: { x: number; y: number };
  val: { x: number; y: number };
};

class DrawTooltipCommand implements GraphCommand {
  protected destroyController: AbortController | null = null;
  protected data: TooltipData = {
    coord: { x: 0, y: 0 },
    val: { x: 0, y: 0 },
  };
  protected hoveredPoint: TooltipData | null = null;
  protected highlightedPoints: (TooltipData & { id: string })[] = [];
  protected boundHandleMouseDown: ReturnType<typeof this.handleMouseDown.bind>;
  protected settings: TooltipSettings;
  constructor(
    public graph: Graph,
    public functionCommand: DrawFunctionCommand
  ) {
    this.settings = {
      maxFractionDigits: 7,
      textHeight: this.graph.dpr * 18,
      padding: this.graph.dpr * 16,
      shadowColor: CSS_VARIABLES.shadowLevel2,
      shadowBlur: 8,
      pointRadius: this.graph.dpr * 4,
      font: `400 ${this.graph.dpr * 18}px Inter`,
      borderRadius: this.graph.dpr * 4,
      margin: this.graph.dpr * 8,
    };
    // focused state initially on creation
    this.destroyController = new AbortController();
    this.init();
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.graph.on("mouseDown", this.boundHandleMouseDown);
  }

  syncState<T extends typeof this.functionCommand.state>(state: T) {
    if (state === "idle") {
      this.hoveredPoint = null;
      this.highlightedPoints = [];
      this.destroyController?.abort();
      this.destroyController = null;
    } else if (state === "focused") {
      if (!this.destroyController) {
        this.destroyController = new AbortController();
        this.init();
      }
    } else {
      if (!this.destroyController) {
        this.destroyController = new AbortController();
        this.init();
      }
    }
  }

  handleMouseDown(e: MouseEventData) {
    if (this.functionCommand.settings.hidden) return;

    const tolerance = 0.25 * this.graph.scales.scaler;
    const param = this.functionCommand.data.f.param;
    let outerX!: number;
    let outerY!: number;
    let offset!: number;

    if (param === "y") {
      const { x, y } = this.calculateValues(e, "y");
      outerX = x;
      outerY = y;

      offset = Math.abs(x) - Math.abs(e.graphX);
    } else {
      const { x, y } = this.calculateValues(e, "x");
      outerX = x;
      outerY = y;

      offset = Math.abs(y) - Math.abs(e.graphY);
    }

    if (offset < tolerance && offset > -tolerance) {
      e.preventDefault();

      if (this.functionCommand.state === "focused") {
        let point: ReturnType<typeof this.getClosestPoint>;
        if (param === "y") {
          point = this.getClosestPoint({ graphY: e.graphY }, "y");
        } else {
          point = this.getClosestPoint({ graphX: e.graphX }, "x");
        }

        if (
          point &&
          this.intersects(
            { x: point.x, y: point.y },
            { x: e.graphX, y: -e.graphY }
          )
        ) {
          const id = `(${point.x}, ${point.y})`;
          for (let i = 0; i < this.highlightedPoints.length; i++) {
            if (this.highlightedPoints[i].id === id) {
              this.highlightedPoints.splice(i, 1);
              return;
            }
          }

          this.highlightedPoints.push({
            val: {
              x: this.roundValue(point.x, this.settings.maxFractionDigits),
              y: this.roundValue(point.y, this.settings.maxFractionDigits),
            },
            coord: {
              x: point.xCoord,
              y: point.yCoord,
            },
            id,
          });
          return;
        }
      }

      this.setData(outerX, outerY);
      this.functionCommand.setState("dragged");
    } else {
      if (this.functionCommand.state !== "idle") {
        this.functionCommand.setState("idle");
      }
    }
  }

  private roundValue(val: number, precision: number) {
    if (precision <= 0) {
      return roundToNeareastMultiple(val, 10, -precision + 2);
    } else {
      return clampNumber(val, precision);
    }
  }

  private calculateValues<T extends "x" | "y">(
    e: T extends "x"
      ? { graphX: number; graphY?: number }
      : { graphY: number; graphX?: number },
    param: T
  ): { x: number; y: number } {
    const maxFractionDigits = this.settings.maxFractionDigits;
    const precision = 2 - this.graph.scales.exponent;
    let x: number = e["graphX"]! ? e["graphX"]! : 0;
    let y: number = -e["graphY"]! ? -e["graphY"]! : 0;

    if (param === "y") {
      if (precision <= 0) {
        y = this.roundValue(y, precision);
        x = this.functionCommand.data.f.f(y);
        x = this.roundValue(x, precision);
      } else if (precision > 0 && precision <= 7) {
        y = this.roundValue(y, precision);
        x = this.functionCommand.data.f.f(y);
        x = clampNumber(x, maxFractionDigits);
      } else {
        y = this.roundValue(y, precision);
        x = this.functionCommand.data.f.f(y);
      }
    } else {
      const fn = this.functionCommand.data.f.f;

      if (precision <= 0) {
        x = this.roundValue(x, precision);
        y = fn(x);
        y = this.roundValue(y, precision);
      } else if (precision > 0 && precision <= 7) {
        x = this.roundValue(x, precision);
        y = fn(x);
        y = clampNumber(y, maxFractionDigits);
      } else {
        x = this.roundValue(x, precision);
        y = fn(x);
      }
    }
    return { x, y };
  }

  private setData(x: number, y: number) {
    this.data.val.x = x;
    this.data.val.y = y;

    const normFactor = this.graph.scales.scaledStep / this.graph.scales.scaler;

    this.data.coord.x = x * normFactor;
    this.data.coord.y = -y * normFactor;
  }

  private calculateGraphCoordinates(offsetX: number, offsetY: number) {
    const yTiles =
      (offsetY * this.graph.dpr -
        (this.graph.canvasCenterY + this.graph.offsetY)) /
      this.graph.scales.scaledStep;
    const graphY = yTiles * this.graph.scales.scaler;

    const xTiles =
      (offsetX * this.graph.dpr -
        (this.graph.canvasCenterX + this.graph.offsetX)) /
      this.graph.scales.scaledStep;
    const graphX = xTiles * this.graph.scales.scaler;

    return { graphX, graphY };
  }

  intersects(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return dx ** 2 + dy ** 2 < this.graph.scales.scaler ** 2 * 0.1;
  }

  init() {
    this.graph.canvas.addEventListener(
      "mousemove",
      (e) => {
        if (this.functionCommand.state === "idle") return;

        let closest: ReturnType<typeof this.getClosestPoint> = null;

        const { graphX, graphY } = this.calculateGraphCoordinates(
          e.offsetX,
          e.offsetY
        );

        if (this.functionCommand.data.f.param === "y") {
          const { x, y } = this.calculateValues({ graphY }, "y");
          if (this.functionCommand.state === "dragged") {
            this.setData(x, y);
          } else {
            closest = this.getClosestPoint({ graphY }, "y");
          }
        } else {
          const { x, y } = this.calculateValues({ graphX }, "x");
          if (this.functionCommand.state === "dragged") {
            this.setData(x, y);
          } else {
            closest = this.getClosestPoint({ graphX }, "x");
          }
        }

        if (closest) {
          if (
            this.intersects(
              { x: closest.x, y: closest.y },
              { x: graphX, y: -graphY }
            )
          ) {
            document.body.style.cursor = "pointer";
            this.hoveredPoint = {
              val: {
                x: this.roundValue(closest.x, this.settings.maxFractionDigits),
                y: this.roundValue(closest.y, this.settings.maxFractionDigits),
              },
              coord: {
                x: closest.xCoord,
                y: closest.yCoord,
              },
            };
          } else {
            this.hoveredPoint = null;
            document.body.style.cursor = "default";
          }
        }
      },
      { signal: this.destroyController!.signal }
    );
    window.addEventListener(
      "mouseup",
      (e) => {
        this.functionCommand.setState("focused");
      },
      { signal: this.destroyController!.signal }
    );
  }

  getClosestPoint<T extends "x" | "y">(
    e: T extends "x"
      ? { graphX: number; graphY?: number }
      : { graphY: number; graphX?: number },
    param: T
  ): { x: number; y: number; xCoord: number; yCoord: number } | null {
    const inputPoint: number = this.functionCommand.data.f.inputIntercept;
    let closestOutputPoint: number | null;
    let closestCriticalPoint: [number, number] | null;

    if (param === "y") {
      closestOutputPoint = binarySearchClosest(
        -e.graphY!,
        this.functionCommand.data.f.outputIntercepts
      );

      closestCriticalPoint = binarySearchClosest(
        -e.graphY!,
        this.functionCommand.data.df.criticalPoints,
        (val) => val[1]
      );
    } else {
      closestOutputPoint = binarySearchClosest(
        e.graphX!,
        this.functionCommand.data.f.outputIntercepts
      );

      closestCriticalPoint = binarySearchClosest(
        e.graphX!,
        this.functionCommand.data.df.criticalPoints,
        (val) => val[0]
      );
    }

    const normFactor = this.graph.scales.scaledStep / this.graph.scales.scaler;
    let x!: number;
    let xCoord!: number;
    let y!: number;
    let yCoord!: number;

    if (param === "y") {
      if (!closestOutputPoint && !closestCriticalPoint) {
        // y intercept

        x = inputPoint;
        y = 0;
        xCoord = x * normFactor;
        yCoord = -y * normFactor;
      } else if (!closestOutputPoint) {
        const closest =
          Math.abs(-e.graphY! - 0) <
          Math.abs(-e.graphY! - closestCriticalPoint![1])
            ? inputPoint
            : closestCriticalPoint!;

        if (typeof closest === "number") {
          x = closest;
          y = 0;
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        } else {
          x = closest[0];
          y = closest[1];
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        }
      } else if (!closestCriticalPoint) {
        if (
          Math.abs(-e.graphY! - 0) < Math.abs(-e.graphY! - closestOutputPoint!)
        ) {
          x = inputPoint;
          y = 0;
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        } else {
          x = this.functionCommand.data.f.f(closestOutputPoint);
          y = closestOutputPoint;
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        }
      } else {
        let closest: [number, number];

        Math.abs(-e.graphY! - 0) <
        Math.abs(-e.graphY! - closestCriticalPoint[1])
          ? (closest = [inputPoint, 0])
          : (closest = closestCriticalPoint);

        Math.abs(-e.graphY! - closest[1]) <
        Math.abs(-e.graphY! - closestOutputPoint!)
          ? null
          : (closest = [
              this.functionCommand.data.f.f(closestOutputPoint),
              closestOutputPoint,
            ]);

        x = closest[0];
        y = closest[1];
        xCoord = x * normFactor;
        yCoord = -y * normFactor;
      }
    } else {
      if (!closestOutputPoint && !closestCriticalPoint) {
        // x intercept
        x = 0;
        y = inputPoint;
        xCoord = x * normFactor;
        yCoord = -y * normFactor;
      } else if (!closestOutputPoint) {
        const closest =
          Math.abs(e.graphX! - 0) <
          Math.abs(e.graphX! - closestCriticalPoint![0])
            ? inputPoint
            : closestCriticalPoint!;

        if (typeof closest === "number") {
          x = 0;
          y = closest;
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        } else {
          x = closest[0];
          y = closest[1];
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        }
      } else if (!closestCriticalPoint) {
        if (
          Math.abs(e.graphX! - 0) < Math.abs(e.graphX! - closestOutputPoint!)
        ) {
          x = 0;
          y = inputPoint;
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        } else {
          x = closestOutputPoint;
          y = this.functionCommand.data.f.f(closestOutputPoint);
          xCoord = x * normFactor;
          yCoord = -y * normFactor;
        }
      } else {
        let closest: [number, number];

        Math.abs(e.graphX! - 0) < Math.abs(e.graphX! - closestCriticalPoint[0])
          ? (closest = [0, inputPoint])
          : (closest = closestCriticalPoint);

        Math.abs(e.graphX! - closest[0]) <
        Math.abs(e.graphX! - closestOutputPoint!)
          ? null
          : (closest = [
              closestOutputPoint,
              this.functionCommand.data.f.f(closestOutputPoint),
            ]);

        x = closest[0];
        y = closest[1];
        xCoord = x * normFactor;
        yCoord = -y * normFactor;
      }
    }

    return { x, y, xCoord, yCoord };
  }

  draw(): void {
    this.graph.ctx.fillStyle = CSS_VARIABLES.secondaryContainer;

    // focused drawings

    this.graph.ctx.beginPath();
    if (this.functionCommand.data.f.param === "y") {
      this.drawCriticalPoints("y");
    } else {
      this.drawCriticalPoints("x");
    }

    if (this.highlightedPoints.length) {
      this.graph.ctx.fillStyle = CSS_VARIABLES.secondary;
      this.highlightedPoints.forEach((point) => {
        // point

        this.graph.ctx.beginPath();
        this.graph.ctx.arc(
          point.coord.x,
          point.coord.y,
          this.settings.pointRadius,
          0,
          Math.PI * 2
        );
        this.graph.ctx.fill();

        this.drawTooltip(
          point.val.x,
          point.val.y,
          point.coord.x,
          point.coord.y,
          false
        );
      });
    }

    if (this.hoveredPoint) {
      this.drawTooltip(
        this.hoveredPoint.val.x,
        this.hoveredPoint.val.y,
        this.hoveredPoint.coord.x,
        this.hoveredPoint.coord.y,
        false
      );
    }

    if (this.functionCommand.state === "dragged") {
      // Point
      this.graph.ctx.fillStyle = this.functionCommand.settings.color;
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
      this.drawTooltip(
        this.data.val.x,
        this.data.val.y,
        this.data.coord.x,
        this.data.coord.y
      );
    }
  }

  drawCriticalPoints(param: "x" | "y") {
    const normFactor = this.graph.scales.scaledStep / this.graph.scales.scaler;

    let x: number =
      param === "x"
        ? 0
        : this.functionCommand.data.f.inputIntercept * normFactor;
    let y: number =
      param === "x"
        ? -this.functionCommand.data.f.inputIntercept * normFactor
        : 0;

    this.graph.ctx.arc(x, y, this.settings.pointRadius, 0, Math.PI * 2);
    this.graph.ctx.fill();

    const outputIntercepts = this.functionCommand.data.f.outputIntercepts;
    for (let i = 0; i < outputIntercepts.length; i++) {
      x = param === "x" ? outputIntercepts[i] * normFactor : 0;

      y = param === "x" ? 0 : -outputIntercepts[i] * normFactor;

      this.graph.ctx.beginPath();
      this.graph.ctx.arc(x, y, this.settings.pointRadius, 0, Math.PI * 2);
      this.graph.ctx.fill();
    }

    const criticalPoints = this.functionCommand.data.df.criticalPoints;
    for (let i = 0; i < criticalPoints.length; i++) {
      this.graph.ctx.beginPath();
      this.graph.ctx.arc(
        criticalPoints[i][0] * normFactor,
        -criticalPoints[i][1] * normFactor,
        this.settings.pointRadius,
        0,
        Math.PI * 2
      );
      this.graph.ctx.fill();
    }
  }

  createTooltipText(
    xVal: number,
    yVal: number,
    showFullPrecision: boolean = true
  ) {
    if (this.graph.scales.scaler < 1e-5 || this.graph.scales.scaler > 2e4) {
      const x = toScientificNotation(xVal, 2);
      const y = toScientificNotation(xVal, 2);
      return {
        x,
        y,
      };
    } else {
      // for values <= 1e-7 js converts then to
      // scientific notation, don't have a solution yet

      return `(${
        Math.abs(xVal) <= 9.99e-7
          ? showFullPrecision
            ? xVal.toFixed(this.settings.maxFractionDigits)
            : 0
          : xVal
      }, ${
        Math.abs(yVal) <= 9.99e-7
          ? showFullPrecision
            ? yVal.toFixed(this.settings.maxFractionDigits)
            : 0
          : yVal
      })`;
    }
  }

  getTooltipCoord(textWidth: number, pointX: number, pointY: number) {
    const margin = this.settings.margin;
    const height = this.settings.textHeight;

    let tooltipX: number = 0;
    let tooltipY: number = 0;
    let tooltipW: number = textWidth + this.settings.padding;
    let tooltipH: number = height + this.settings.padding;

    //default postion Top Left

    const tooltipLeft = pointX - margin - tooltipW;
    const tooltipTop = pointY - margin - tooltipH;

    if (
      tooltipLeft > this.graph.clientLeft &&
      tooltipTop > this.graph.clientTop
    ) {
      tooltipX = tooltipLeft;
      tooltipY = tooltipTop;
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
      tooltipY = tooltipTop;
    } else if (
      tooltipLeft < this.graph.clientLeft &&
      tooltipTop < this.graph.clientTop
    ) {
      tooltipX = pointX + margin;
      tooltipY = pointY + margin;
    }

    return { tooltipX, tooltipY, tooltipW, tooltipH };
  }

  drawTooltip(
    valX: number,
    valY: number,
    pointX: number,
    pointY: number,
    showFullPrecision: boolean = true
  ) {
    this.graph.ctx.font = this.settings.font;
    this.graph.ctx.textAlign = "start";

    let tooltipText = this.createTooltipText(valX, valY, showFullPrecision);
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

      const { tooltipX, tooltipY, tooltipW, tooltipH } = this.getTooltipCoord(
        totalMetricsWidth,
        pointX,
        pointY
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
        textMetrics.width,
        pointX,
        pointY
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
