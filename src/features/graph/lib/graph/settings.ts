import { throttle } from "../../../../helpers/performance";
import { Graph } from "./graph";

export class GraphSettings {
  protected MAX_TRANSLATE = 1000000;
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

    const ease: number = 10;
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

    this.graph.on("scale", (e) => {
      if (
        (this.clientBottom < -this.MAX_TRANSLATE ||
          this.clientTop > this.MAX_TRANSLATE ||
          this.clientLeft > this.MAX_TRANSLATE ||
          this.clientRight < -this.MAX_TRANSLATE) &&
        e.zoomDirection === "IN"
      )
        return;

      const dx = e.offsetX * this.dpr - (this.canvasCenterX + this.offsetX);
      const dy = e.offsetY * this.dpr - (this.canvasCenterY + this.offsetY);

      if (Math.abs(dx) > wheelTolerance || Math.abs(dy) > wheelTolerance) {
        const roundedX = Math.round(dx / ease);
        const roundedY = Math.round(dy / ease);
        if (e.zoomDirection === "IN") {
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
    });

    let lastMouseX = 0;
    let lastMouseY = 0;

    this.graph.canvas.addEventListener(
      "mousedown",
      (e) => {
        // determine if a function is being focused
        // and pass control to tooltip
        const xTiles =
          (e.offsetX * this.dpr - (this.canvasCenterX + this.offsetX)) /
          this.graph.scales.scaledStep;
        const graphX = xTiles * this.graph.scales.scaler;

        const yTiles =
          (e.offsetY * this.dpr - (this.canvasCenterY + this.offsetY)) /
          this.graph.scales.scaledStep;
        const graphY = yTiles * this.graph.scales.scaler;

        const cutomEvent = {
          graphX,
          graphY,
          preventDefault(debug?: string) {
            this.defaultPrevented = true;
            console.log(debug);
          },
          defaultPrevented: false,
        };

        console.log(this.graph);
        this.graph.dispatch("mouseDown", cutomEvent);

        if (cutomEvent.defaultPrevented) {
          return;
        }

        this.isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      },
      { signal: this.destroyController.signal }
    );

    const throttleMouseMove = throttle((e) => {
      if (this.graph.destroyed) return;
      if (!this.isDragging) return;

      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
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
