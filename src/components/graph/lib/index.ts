import { throttle } from "../../../helpers/performance";
import { CSS_VARIABLES } from "../../../data/css/variables";

// NOTES

// fix floating point label errors
// starting from 5 X 10^-6 or 5 X 10^6
// when you reach a multiple of 10, increase or decrease respectively, 10 X 10^-6 => 10^-5

window.addEventListener("load", () => {
  const canvas = document.getElementById(
    "graph-calculator"
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // ctx.fillRect(100 - 8, 100 - 20, 64, 32);

  // ctx.font = "bold 14px Inter";
  // ctx.strokeStyle = "white";
  // ctx.lineWidth = 4;
  // ctx.strokeText("100", 100, 100);
  // ctx.fillText("100", 100, 100);

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

interface GraphCommand {
  readonly graph: Graph;
  draw(): void;
}

interface GraphCommandController {
  readonly commands: GraphCommand[];
  add(command: GraphCommand): void;
  remove(command: GraphCommand): void;
  render(): void;
  clear(graph: Graph): void;
}

class CommandController implements GraphCommandController {
  public commands: GraphCommand[] = [];
  constructor() {}

  remove(command: GraphCommand): void {
    for (let i = 0; i < this.commands.length; ++i) {
      if (this.commands[i] === command) {
        this.commands.splice(i, 1);
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

interface Observer<T> {
  observable: Observable<T>;
  update<T>(data: T): void;
  viewState(): T;
}

interface Observable<T> {
  add(observer: Observer<T>): void;
  remove(observer: Observer<T>): void;
  notify<T>(data: T): void;
  get state(): T;
  set state(newState: T);
}

type ScaleEventData = {
  zoomDirection: "IN" | "OUT";
};

type EventDataMap = {
  scale: ScaleEventData;
};

const GRAPH_EVENT_NAMES = ["scale"] as const;

interface BusEvent {
  readonly callbacks: Function[];
  register(cb: Function): void;
  deregister(cb: Function): void;
  execute<T>(data: T): void;
}

type Event_Name = (typeof GRAPH_EVENT_NAMES)[number];

interface MessageBus {
  readonly events: Record<string, BusEvent>;
  dispatch<K extends keyof EventDataMap>(
    eventName: K,
    data: EventDataMap[K]
  ): void;
  on<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void;
  removeListener<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void;
}

class ScaleEvent implements BusEvent {
  public callbacks: Function[] = [];
  constructor() {}
  register(cb: Function): void {
    this.callbacks.push(cb);
  }
  deregister(cb: Function): void {
    for (let i = 0; i < this.callbacks.length; ++i) {
      if (this.callbacks[i] === cb) {
        this.callbacks.splice(i, 1);
        break;
      }
    }
  }
  execute<T>(data: T): void {
    this.callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

const eventMap: Record<Event_Name, new () => BusEvent> = {
  scale: ScaleEvent,
};

class Scales {
  private ZOOM_FACTOR = 1.1;
  private MAX_ZOOM = 1.8;
  private MIN_ZOOM = 0.8;
  private _scaler!: number;
  private _majorGridLine!: number;
  protected _scaledStep: number;
  protected zoom: number;
  private scalesIndex: number;
  private scalesArray: string[] = [];
  constructor(public graph: Graph, readonly step: number, readonly n: number) {
    this._scaledStep = this.step;
    this.zoom = 1;
    this.scalesIndex = this.n * 3;
    this.init();
  }

  get scaler() {
    return this._scaler;
  }

  get majorGridLine() {
    return this._majorGridLine;
  }

  getRawScaler(): string {
    return this.scalesArray[this.scalesIndex];
  }

  private updateScales() {
    this._scaler = parseFloat(this.scalesArray[this.scalesIndex]);
    this._majorGridLine = this.scalesArray[this.scalesIndex][0] === "5" ? 4 : 5;
  }

  get scaledStep(): number {
    return this._scaledStep;
  }

  private init() {
    const scaleFactors = [1, 2, 5];
    for (let i = -this.n; i <= this.n; ++i) {
      let j = 0;

      while (j < scaleFactors.length) {
        this.scalesArray.push(`${scaleFactors[j]}e${i}`);
        j++;
      }
    }

    this._scaler = parseFloat(this.scalesArray[this.scalesIndex]);
    this._majorGridLine = this.scalesArray[this.scalesIndex][0] === "5" ? 4 : 5;
    this.graph.on("scale", this.handleScale.bind(this));
  }

  protected handleScale(e: ScaleEventData) {
    this.zoom *=
      e.zoomDirection === "OUT" ? 1 / this.ZOOM_FACTOR : this.ZOOM_FACTOR;

    this._scaledStep = this.step * this.zoom;

    // zoom out
    if (this.zoom > this.MAX_ZOOM) {
      this.zoom = this.MIN_ZOOM;
      this._scaledStep = this.step * this.MIN_ZOOM;
      this.scalesIndex -= 1;
      this.updateScales();
    }

    //zoom in

    if (this.zoom < this.MIN_ZOOM) {
      this.zoom = this.MAX_ZOOM;
      this._scaledStep = this.step * this.MAX_ZOOM;
      this.scalesIndex += 1;
      this.updateScales();
    }
  }
}

type DrawData = {
  scaledStep: number;
  scaler: number;
  majorGridLine: number;
  scientificNotation: string[];
};

class DrawGridCommand implements GraphCommand {
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

    this.drawHorizontalTop(drawData);
    this.drawHorizontalBottom(drawData);

    this.graph.ctx.restore();
  }

  drawHorizontalTop(data: DrawData) {
    if (this.graph.clientTop > 0) return;

    let count: number = 1;
    let y = -data.scaledStep;

    // reduce unnecessary computations

    if (this.graph.clientBottom < 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientBottom) / data.scaledStep
      );
      y = -data.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (y; y > this.graph.clientTop; y -= data.scaledStep) {
      if (count % data.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(
          count,
          data.scaler,
          data.scientificNotation,
          "pos"
        );

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
    let y = data.scaledStep;

    // // reduce unnecessary computations

    if (this.graph.clientTop > 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientTop) / data.scaledStep
      );
      y = data.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (y; y < this.graph.clientBottom; y += data.scaledStep) {
      if (count % data.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(this.graph.clientLeft, y);
        this.graph.ctx.lineTo(this.graph.clientRight, y);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(
          count,
          data.scaler,
          data.scientificNotation,
          "neg"
        );

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
    let x = -data.scaledStep;

    // // reduce unnecessary computations

    if (this.graph.clientRight < 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientRight) / data.scaledStep
      );
      x = -data.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (x; x > this.graph.clientLeft; x -= data.scaledStep) {
      if (count % data.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(
          count,
          data.scaler,
          data.scientificNotation,
          "neg"
        );

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
    let x = data.scaledStep;

    // reduce unnecessary computations

    if (this.graph.clientLeft > 0) {
      const stepMultiple = Math.floor(
        Math.abs(this.graph.clientLeft) / data.scaledStep
      );
      x = data.scaledStep * stepMultiple;
      count = stepMultiple;
    }

    for (x; x < this.graph.clientRight; x += data.scaledStep) {
      if (count % data.majorGridLine === 0) {
        this.graph.ctx.save();
        this.graph.ctx.lineWidth = 1;
        this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLow;

        // grid lines

        this.graph.ctx.beginPath();
        this.graph.ctx.moveTo(x, this.graph.clientTop);
        this.graph.ctx.lineTo(x, this.graph.clientBottom);
        this.graph.ctx.stroke();

        // text

        const label = this.generateLabel(
          count,
          data.scaler,
          data.scientificNotation,
          "pos"
        );

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

  generateLabel(
    count: number,
    scaler: number,
    scientificNotation: string[],
    sign: "neg" | "pos"
  ): string | string[] {
    if (count === 0) return "";

    let label: string = "";
    const scalerCoefficient = Number(scientificNotation[0]);

    // 5 * 10^5 is min
    if (scaler < 1e-5 || scaler > 2e4) {
      const labels: string[] = [];
      let exponent = Number(scientificNotation[1]);
      let labelCoefficient = count * Number(scientificNotation[0]);
      let labelCoefficientPower: number = 1;

      if (labelCoefficient >= 10) {
        labelCoefficientPower = Math.floor(Math.log10(labelCoefficient));
        const labelCoefficientOffset =
          labelCoefficient / 10 ** labelCoefficientPower;

        exponent += labelCoefficientPower;
        labelCoefficient = labelCoefficientOffset;
      }

      if (exponent >= -4 && exponent < 3) {
        // sign is negative if exponent is <=4 always
        if (scaler < 0.1) {
          if (sign === "neg") {
            label = `-${(count * scaler).toFixed(
              Math.abs(Number(scientificNotation[1])) -
                (scalerCoefficient === 1 ? 0 : 1)
            )}`;
          } else {
            label = `${(count * scaler).toFixed(
              Math.abs(Number(scientificNotation[1])) -
                (scalerCoefficient === 1 ? 0 : 1)
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
          Math.abs(Number(scientificNotation[1])) -
            (scalerCoefficient === 1 ? 0 : 1)
        )}`;
      } else {
        label = `${(count * scaler).toFixed(
          Math.abs(Number(scientificNotation[1])) -
            (scalerCoefficient === 1 ? 0 : 1)
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

class DrawAxisCommand implements GraphCommand {
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

class Graph implements MessageBus {
  readonly events: Record<string, BusEvent> = {};
  protected dpr: number;
  protected commandController: GraphCommandController;
  readonly scales: Scales;
  private _canvasCenterX!: number;
  private _canvasCenterY!: number;
  protected isDragging: boolean = false;
  private _offsetX: number = 0;
  private _offsetY: number = 0;
  private _clientTop!: number;
  private _clientBottom!: number;
  private _clientLeft!: number;
  private _clientRight!: number;
  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D
  ) {
    this.commandController = new CommandController();
    this.dpr = window.devicePixelRatio || 1;
    this.scales = new Scales(this, 30, 15);
    this.init();
  }

  get offsetX() {
    return this._offsetX;
  }
  get offsetY() {
    return this._offsetY;
  }
  get clientTop() {
    return this._clientTop;
  }
  get clientBottom() {
    return this._clientBottom;
  }
  get clientLeft() {
    return this._clientLeft;
  }
  get clientRight() {
    return this._clientRight;
  }
  get canvasCenterX() {
    return this._canvasCenterX;
  }
  get canvasCenterY() {
    return this._canvasCenterY;
  }

  private init() {
    // graph settings

    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this._canvasCenterX = Math.round(this.canvas.width / 2);
    this._canvasCenterY = Math.round(this.canvas.height / 2);
    this.ctx.translate(this._canvasCenterX, this._canvasCenterY);

    this._clientTop = -this._canvasCenterY - this._offsetY;
    this._clientBottom = this._canvasCenterY - this.offsetY;
    this._clientLeft = -this._canvasCenterX - this._offsetX;
    this._clientRight = this._canvasCenterX - this._offsetX;

    // ctx settings

    this.ctx.font = `500 ${14 * this.dpr}px Inter`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // init event listeners
    this.initEvents();
  }

  private initEvents() {
    //scoped variables

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
        const zoomDirection = e.deltaY > 0 ? "OUT" : "IN";

        const dx = e.offsetX * this.dpr - (this.canvasCenterX + this.offsetX);
        const dy = e.offsetY * this.dpr - (this.canvasCenterY + this.offsetY);

        if (Math.abs(dx) > wheelTolerance || Math.abs(dy) > wheelTolerance) {
          const roundedX = Math.round(dx / 10);
          const roundedY = Math.round(dy / 10);
          if (zoomDirection === "IN") {
            this._offsetX += -roundedX;
            this._offsetY += -roundedY;
            this.updateClientPosition(this._offsetX, this._offsetY);
            this.ctx.translate(-roundedX, -roundedY);
          } else {
            this._offsetX += roundedX;
            this._offsetY += roundedY;
            this.updateClientPosition(this._offsetX, this._offsetY);
            this.ctx.translate(roundedX, roundedY);
          }
        }

        this.dispatch("scale", { zoomDirection });
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

        this._offsetX += dx;
        this._offsetY += dy;
        this.updateClientPosition(this._offsetX, this._offsetY);

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

  private updateClientPosition(offsetX: number, offsetY: number) {
    this._clientLeft = -this._canvasCenterX - offsetX;
    this._clientRight = this._canvasCenterX - offsetX;
    this._clientTop = -this._canvasCenterY - offsetY;
    this._clientBottom = this._canvasCenterY - offsetY;
  }

  private reset() {
    // reset canvas settings

    this._canvasCenterX = Math.round(this.canvas.width / 2);
    this._canvasCenterY = Math.round(this.canvas.height / 2);
    this.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    this._offsetX = 0;
    this._offsetY = 0;
    this.updateClientPosition(this._offsetX, this._offsetY);

    // reset ctx settings

    this.ctx.font = `500 ${16 * this.dpr}px Inter`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  }

  // MESSAGE BUS

  dispatch<K extends keyof EventDataMap>(
    eventName: K,
    data: EventDataMap[K]
  ): void {
    const busEvent = this.events[eventName];

    if (!busEvent) return;

    busEvent.execute(data);
  }

  on<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void {
    if (this.events[eventName]) {
      this.events[eventName].register(cb);
    } else {
      const busEvent = new eventMap[eventName]();
      busEvent.register(cb);
      this.events[eventName] = busEvent;
    }
  }

  removeListener<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void {
    const busEvent = this.events[eventName];

    if (!busEvent) return;

    busEvent.deregister(cb);
  }

  // COMMAND PROXY

  addCommand(command: GraphCommand) {
    this.commandController.add(command);
  }

  removeCommand(command: GraphCommand) {
    this.commandController.remove(command);
  }

  renderCommands() {
    this.commandController.render();
  }

  clearCommands() {
    this.commandController.clear(this);
  }
}
