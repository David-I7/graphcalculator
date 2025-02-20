import { throttle } from "../../../../helpers/performance";
import { eventMap } from "../../data/events";
import {
  BusEvent,
  EventDataMap,
  GraphCommand,
  GraphCommandController,
  MessageBus,
} from "../../interfaces";
import { CommandController } from "./commands";
import { Scales } from "./scales";

export class Graph implements MessageBus {
  readonly events: Record<string, BusEvent> = {};
  protected commandController: GraphCommandController;
  protected settings!: GraphSettings;
  readonly scales: Scales;
  public destroyed: boolean = false;
  // protected dpr: number;
  // private _canvasCenterX!: number;
  // private _canvasCenterY!: number;
  // private _offsetX: number = 0;
  // private _offsetY: number = 0;
  // private _clientTop!: number;
  // private _clientBottom!: number;
  // private _clientLeft!: number;
  // private _clientRight!: number;
  // protected isDragging: boolean = false;
  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D
  ) {
    this.commandController = new CommandController();
    this.settings = new GraphSettings(this);
    this.scales = new Scales(this, 30, 15);
    // this.init();
  }

  get offsetX() {
    return this.settings.offsetX;
  }
  get offsetY() {
    return this.settings.offsetY;
  }
  get clientTop() {
    return this.settings.clientTop;
  }
  get clientBottom() {
    return this.settings.clientBottom;
  }
  get clientLeft() {
    return this.settings.clientLeft;
  }
  get clientRight() {
    return this.settings.clientRight;
  }
  get canvasCenterX() {
    return this.settings.canvasCenterX;
  }
  get canvasCenterY() {
    return this.settings.canvasCenterY;
  }

  // private init() {
  //   // graph settings

  //   this.canvas.width = this.canvas.offsetWidth * this.dpr;
  //   this.canvas.height = this.canvas.offsetHeight * this.dpr;
  //   this._canvasCenterX = Math.round(this.canvas.width / 2);
  //   this._canvasCenterY = Math.round(this.canvas.height / 2);
  //   this.ctx.translate(this._canvasCenterX, this._canvasCenterY);

  //   this._clientTop = -this._canvasCenterY - this._offsetY;
  //   this._clientBottom = this._canvasCenterY - this.offsetY;
  //   this._clientLeft = -this._canvasCenterX - this._offsetX;
  //   this._clientRight = this._canvasCenterX - this._offsetX;

  //   // ctx settings

  //   this.ctx.font = `500 ${14 * this.dpr}px Inter`;
  //   this.ctx.textAlign = "center";
  //   this.ctx.textBaseline = "middle";

  //   // init event listeners
  //   this.initEvents();
  // }

  // private initEvents() {
  //   //scoped variables

  //   const wheelTolerance: number = 75;
  //   let prevWidth: number = this.canvas.offsetWidth;
  //   let prevHeight: number = this.canvas.offsetHeight;

  //   const observer = new ResizeObserver(
  //     throttle(() => {
  //       if (
  //         prevWidth > this.canvas.offsetWidth + 1 ||
  //         prevWidth < this.canvas.offsetWidth - 1 ||
  //         prevHeight > this.canvas.offsetHeight + 1 ||
  //         prevHeight < this.canvas.offsetHeight - 1
  //       ) {
  //         this.canvas.width = this.canvas.offsetWidth * this.dpr;
  //         this.canvas.height = this.canvas.offsetHeight * this.dpr;
  //         prevWidth = this.canvas.offsetWidth;
  //         prevHeight = this.canvas.offsetHeight;
  //         this.reset();
  //       }
  //     }, 50).throttleFunc
  //   );
  //   observer.observe(this.canvas.parentElement!);

  //   this.canvas.addEventListener(
  //     "wheel",
  //     (e) => {
  //       e.preventDefault();
  //       const zoomDirection = e.deltaY > 0 ? "OUT" : "IN";

  //       const dx = e.offsetX * this.dpr - (this.canvasCenterX + this.offsetX);
  //       const dy = e.offsetY * this.dpr - (this.canvasCenterY + this.offsetY);

  //       if (Math.abs(dx) > wheelTolerance || Math.abs(dy) > wheelTolerance) {
  //         const roundedX = Math.round(dx / 10);
  //         const roundedY = Math.round(dy / 10);
  //         if (zoomDirection === "IN") {
  //           this._offsetX += -roundedX;
  //           this._offsetY += -roundedY;
  //           this.updateClientPosition(this._offsetX, this._offsetY);
  //           this.ctx.translate(-roundedX, -roundedY);
  //         } else {
  //           this._offsetX += roundedX;
  //           this._offsetY += roundedY;
  //           this.updateClientPosition(this._offsetX, this._offsetY);
  //           this.ctx.translate(roundedX, roundedY);
  //         }
  //       }

  //       this.dispatch("scale", { zoomDirection });
  //     },
  //     { passive: false, signal: this.destroyController.signal }
  //   );

  //   let lastMouseX = 0;
  //   let lastMouseY = 0;

  //   this.canvas.addEventListener(
  //     "mousedown",
  //     (e) => {
  //       this.isDragging = true;
  //       lastMouseX = e.clientX;
  //       lastMouseY = e.clientY;
  //     },
  //     { signal: this.destroyController.signal }
  //   );
  //   this.canvas.addEventListener(
  //     "mousemove",
  //     throttle((e) => {
  //       if (!this.isDragging) return;

  //       const dx = Math.round(e.clientX - lastMouseX);
  //       const dy = Math.round(e.clientY - lastMouseY);
  //       lastMouseX = e.clientX;
  //       lastMouseY = e.clientY;

  //       this._offsetX += dx;
  //       this._offsetY += dy;
  //       this.updateClientPosition(this._offsetX, this._offsetY);

  //       this.ctx.translate(dx, dy);
  //     }, 10).throttleFunc,
  //     { signal: this.destroyController.signal }
  //   );
  //   this.canvas.addEventListener(
  //     "mouseup",
  //     () => {
  //       this.isDragging = false;
  //     },
  //     { signal: this.destroyController.signal }
  //   );
  //   this.canvas.addEventListener(
  //     "mouseleave",
  //     () => {
  //       this.isDragging = false;
  //     },
  //     { signal: this.destroyController.signal }
  //   );
  // }

  // private updateClientPosition(offsetX: number, offsetY: number) {
  //   this._clientLeft = -this._canvasCenterX - offsetX;
  //   this._clientRight = this._canvasCenterX - offsetX;
  //   this._clientTop = -this._canvasCenterY - offsetY;
  //   this._clientBottom = this._canvasCenterY - offsetY;
  // }

  // private reset() {
  //   // reset canvas settings

  //   this._canvasCenterX = Math.round(this.canvas.width / 2);
  //   this._canvasCenterY = Math.round(this.canvas.height / 2);
  //   this.ctx.translate(this.canvasCenterX, this.canvasCenterY);

  //   this._offsetX = 0;
  //   this._offsetY = 0;
  //   this.updateClientPosition(this._offsetX, this._offsetY);

  //   // reset ctx settings

  //   this.ctx.font = `500 ${16 * this.dpr}px Inter`;
  //   this.ctx.textAlign = "center";
  //   this.ctx.textBaseline = "middle";
  // }

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

  destroy() {
    this.destroyed = true;
    this.settings.destroy();
  }
}

class GraphSettings {
  protected destroyController: AbortController = new AbortController();
  protected resizeObserver!: ResizeObserver;
  public dpr: number;
  public canvasCenterX!: number;
  public canvasCenterY!: number;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public clientTop!: number;
  public clientBottom!: number;
  public clientLeft!: number;
  public clientRight!: number;
  public isDragging: boolean = false;

  constructor(private graph: Graph) {
    this.dpr = window.devicePixelRatio || 1;
    this.init();
  }

  private init() {
    // graph settings

    this.graph.canvas.width = this.graph.canvas.offsetWidth * this.dpr;
    this.graph.canvas.height = this.graph.canvas.offsetHeight * this.dpr;
    this.canvasCenterX = Math.round(this.graph.canvas.width / 2);
    this.canvasCenterY = Math.round(this.graph.canvas.height / 2);
    this.graph.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    this.clientTop = -this.canvasCenterY - this.offsetY;
    this.clientBottom = this.canvasCenterY - this.offsetY;
    this.clientLeft = -this.canvasCenterX - this.offsetX;
    this.clientRight = this.canvasCenterX - this.offsetX;

    // ctx settings

    this.graph.ctx.font = `500 ${14 * this.dpr}px Inter`;
    this.graph.ctx.textAlign = "center";
    this.graph.ctx.textBaseline = "middle";

    // init event listeners
    this.initEvents();
  }

  private initEvents() {
    //scoped variables

    const wheelTolerance: number = 75;
    let prevWidth: number = this.graph.canvas.offsetWidth;
    let prevHeight: number = this.graph.canvas.offsetHeight;

    const throttleResize = throttle(() => {
      if (this.graph.destroyed) return;
      if (
        prevWidth > this.graph.canvas.offsetWidth + 1 ||
        prevWidth < this.graph.canvas.offsetWidth - 1 ||
        prevHeight > this.graph.canvas.offsetHeight + 1 ||
        prevHeight < this.graph.canvas.offsetHeight - 1
      ) {
        this.graph.canvas.width = this.graph.canvas.offsetWidth * this.dpr;
        this.graph.canvas.height = this.graph.canvas.offsetHeight * this.dpr;
        prevWidth = this.graph.canvas.offsetWidth;
        prevHeight = this.graph.canvas.offsetHeight;
        this.reset();
      }
    }, 50);

    this.resizeObserver = new ResizeObserver(throttleResize.throttleFunc);
    this.resizeObserver.observe(this.graph.canvas.parentElement!);

    this.graph.canvas.addEventListener(
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
            this.offsetX += -roundedX;
            this.offsetY += -roundedY;
            this.updateClientPosition(this.offsetX, this.offsetY);
            this.graph.ctx.translate(-roundedX, -roundedY);
          } else {
            this.offsetX += roundedX;
            this.offsetY += roundedY;
            this.updateClientPosition(this.offsetX, this.offsetY);
            this.graph.ctx.translate(roundedX, roundedY);
          }
        }

        this.graph.dispatch("scale", { zoomDirection });
      },
      { passive: false, signal: this.destroyController.signal }
    );

    let lastMouseX = 0;
    let lastMouseY = 0;

    this.graph.canvas.addEventListener(
      "mousedown",
      (e) => {
        this.isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      },
      { signal: this.destroyController.signal }
    );

    const throttleMouseMove = throttle((e) => {
      if (this.graph.destroyed) return;
      if (!this.isDragging) return;

      const dx = Math.round(e.clientX - lastMouseX);
      const dy = Math.round(e.clientY - lastMouseY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      this.offsetX += dx;
      this.offsetY += dy;
      this.updateClientPosition(this.offsetX, this.offsetY);

      this.graph.ctx.translate(dx, dy);
    }, 10);

    this.graph.canvas.addEventListener(
      "mousemove",
      throttleMouseMove.throttleFunc,
      { signal: this.destroyController.signal }
    );
    this.graph.canvas.addEventListener(
      "mouseup",
      () => {
        this.isDragging = false;
      },
      { signal: this.destroyController.signal }
    );
    this.graph.canvas.addEventListener(
      "mouseleave",
      () => {
        this.isDragging = false;
      },
      { signal: this.destroyController.signal }
    );
  }

  private updateClientPosition(offsetX: number, offsetY: number) {
    this.clientLeft = -this.canvasCenterX - offsetX;
    this.clientRight = this.canvasCenterX - offsetX;
    this.clientTop = -this.canvasCenterY - offsetY;
    this.clientBottom = this.canvasCenterY - offsetY;
  }

  private reset() {
    // reset canvas settings

    this.canvasCenterX = Math.round(this.graph.canvas.width / 2);
    this.canvasCenterY = Math.round(this.graph.canvas.height / 2);
    this.graph.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    this.offsetX = 0;
    this.offsetY = 0;
    this.updateClientPosition(this.offsetX, this.offsetY);

    // reset ctx settings

    this.graph.ctx.font = `500 ${16 * this.dpr}px Inter`;
    this.graph.ctx.textAlign = "center";
    this.graph.ctx.textBaseline = "middle";
  }

  destroy() {
    this.destroyController.abort();
    this.resizeObserver.disconnect();
  }
}
