import { debounce, throttle } from "../../../helpers/performance";
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

  graph.addCommand(new DrawGridCommand(graph, 25));
  graph.addCommand(new DrawAxisCommand(graph));

  function animate() {
    graph.clearCommands();
    graph.renderCommands();
    requestAnimationFrame(animate);
  }
  animate();
}

interface GraphCommand {
  graph: Graph;
  draw(): void;
}

interface GraphCommandController {
  commands: GraphCommand[];
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
  scale: number;
};

type EventDataMap = {
  scale: ScaleEventData;
};

const GRAPH_EVENT_NAMES = ["scale"] as const;

interface BusEvent {
  callbacks: Function[];
  register(cb: Function): void;
  deregister(cb: Function): void;
  execute<T>(data: T): void;
}

type Event_Name = (typeof GRAPH_EVENT_NAMES)[number];

interface MessageBus {
  events: Record<string, BusEvent>;
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

class DrawGridCommand implements GraphCommand {
  protected scalesIndex: number = 45;
  protected scales: string[] = [];
  protected scaledStep: number;
  protected n: number = 15;
  protected labelsPadding: number = 14;
  constructor(public graph: Graph, public step: number) {
    this.scaledStep = this.step;

    graph.on("scale", this.scaleHandler.bind(this));

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

  scaleHandler(e: ScaleEventData) {
    this.scaledStep = this.step * e.scale;

    // zoom out
    if (e.scale > 1.8) {
      this.scaledStep = this.step * 0.8;
      this.scalesIndex -= 1;
    }

    //zoom in

    if (e.scale < 0.8) {
      this.scaledStep = this.step * 1.8;
      this.scalesIndex += 1;
    }
  }

  draw(): void {
    this.graph.ctx.save();
    this.graph.ctx.strokeStyle = CSS_VARIABLES.borderLowest;
    this.graph.ctx.lineWidth = 0.5;

    const scale: number = parseFloat(this.scales[this.scalesIndex]);
    const majorGridLine = this.scales[this.scalesIndex][0] === "5" ? 4 : 5;
    const scientificNotation = this.scales[this.scalesIndex].split("e");
    const drawData = {
      scale,
      majorGridLine,
      scientificNotation,
    };

    this.drawVerticalLeft(drawData);
    this.drawVerticalRight(drawData);

    //center

    this.graph.ctx.fillText(`0`, -this.labelsPadding, this.labelsPadding);

    this.drawHorizontalTop(drawData);
    this.drawHorizontalBottom(drawData);

    this.graph.ctx.restore();
  }

  drawHorizontalTop(data: {
    scale: number;
    majorGridLine: number;
    scientificNotation: string[];
  }) {
    let count: number = 1;

    let y = -this.scaledStep;

    for (y; y > this.graph.clientTop; y -= this.scaledStep) {
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
          data.scale,
          data.scientificNotation,
          "positive"
        );

        // sticky labels

        const textMetrics = this.graph.ctx.measureText(label);

        if (0 < this.graph.clientLeft) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            this.graph.clientLeft + textMetrics.width / 2 + this.labelsPadding,
            y
          );
          this.graph.ctx.restore();
          count++;
          continue;
        } else if (0 > this.graph.clientRight) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            this.graph.clientRight - this.labelsPadding - textMetrics.width / 2,
            y
          );
          this.graph.ctx.restore();
          count++;
          continue;
        }

        this.graph.ctx.fillText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          y
        );
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
  drawHorizontalBottom(data: {
    scale: number;
    majorGridLine: number;
    scientificNotation: string[];
  }) {
    let count: number = 1;

    for (
      let y = this.scaledStep;
      y < this.graph.clientBottom;
      y += this.scaledStep
    ) {
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
          data.scale,
          data.scientificNotation,
          "negative"
        );

        // sticky labels

        const textMetrics = this.graph.ctx.measureText(label);

        if (0 < this.graph.clientLeft) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            this.graph.clientLeft + this.labelsPadding + textMetrics.width / 2,
            y
          );
          this.graph.ctx.restore();
          count++;
          continue;
        } else if (0 > this.graph.clientRight) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            this.graph.clientRight - this.labelsPadding - textMetrics.width / 2,
            y
          );
          this.graph.ctx.restore();
          count++;
          continue;
        }

        this.graph.ctx.fillText(
          label,
          -textMetrics.width / 2 - this.labelsPadding / 2,
          y
        );
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

  drawVerticalLeft(data: {
    scale: number;
    majorGridLine: number;
    scientificNotation: string[];
  }) {
    let count: number = 1;

    for (
      let x = -this.scaledStep;
      x > this.graph.clientLeft;
      x -= this.scaledStep
    ) {
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
          data.scale,
          data.scientificNotation,
          "negative"
        );

        // sticky labels

        if (0 < this.graph.clientTop) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            x,
            this.graph.clientTop + this.labelsPadding
          );
          this.graph.ctx.restore();
          count++;
          continue;
        } else if (0 > this.graph.clientBottom) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            x,
            this.graph.clientBottom - this.labelsPadding
          );
          this.graph.ctx.restore();
          count++;
          continue;
        }

        this.graph.ctx.fillText(label, x, this.labelsPadding);
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
  drawVerticalRight(data: {
    scale: number;
    majorGridLine: number;
    scientificNotation: string[];
  }) {
    let count: number = 1;

    for (
      let x = this.scaledStep;
      x < this.graph.clientRight;
      x += this.scaledStep
    ) {
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
          data.scale,
          data.scientificNotation,
          "positive"
        );

        // sticky labels

        if (0 < this.graph.clientTop) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            x,
            this.graph.clientTop + this.labelsPadding
          );
          this.graph.ctx.restore();
          count++;
          continue;
        } else if (0 > this.graph.clientBottom) {
          this.graph.ctx.fillStyle = CSS_VARIABLES.onSurfaceBody;
          this.graph.ctx.fillText(
            label,
            x,
            this.graph.clientBottom - this.labelsPadding
          );
          this.graph.ctx.restore();
          count++;
          continue;
        }

        this.graph.ctx.fillText(label, x, this.labelsPadding);
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
    scale: number,
    scientificNotation: string[],
    direction: "negative" | "positive"
  ): string {
    let label: string = "";

    if (scale < 1e-5 || scale > 2e6) {
      // console.log(Number(scientificNotation[0]));
      const humanScientificNotation = `${
        count * Number(scientificNotation[0])
      } X 10^${scientificNotation[1]}`;
      if (direction === "negative") {
        label = "-" + humanScientificNotation;
      } else {
        label = humanScientificNotation;
      }
    } else {
      if (scale < 0.1) {
        if (direction === "negative") {
          label = `-${(count * scale).toFixed(
            Math.abs(Number(scientificNotation[1]))
          )}`;
        } else {
          label = `${(count * scale).toFixed(
            Math.abs(Number(scientificNotation[1]))
          )}`;
        }
      } else {
        if (direction === "negative") {
          label = `-${count * scale}`;
        } else {
          label = `${count * scale}`;
        }
      }
    }

    return label;
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
  public events: Record<string, BusEvent> = {};
  protected dpr: number;
  protected commandController: GraphCommandController;
  private _canvasCenterX!: number;
  private _canvasCenterY!: number;
  private _scale: number = 1;
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
    this.init();
  }

  get scale() {
    return this._scale;
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

        this._scale =
          this.scale > 1.8 ? 0.8 : this.scale < 0.8 ? 1.8 : this.scale;
        this._scale *= zoomDirection === "OUT" ? 1 / scaleFactor : scaleFactor;
        this.dispatch("scale", { scale: this.scale });
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
