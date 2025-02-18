import { throttle } from "../../../helpers/performance";
import { eventMap } from "../data/events";
import {
  BusEvent,
  EventDataMap,
  GraphCommand,
  GraphCommandController,
  MessageBus,
} from "../interfaces";
import { CommandController } from "./commands";
import { Scales } from "./scales";

export class Graph implements MessageBus {
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
      }, 50).throttleFunc
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
      }, 10).throttleFunc
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
