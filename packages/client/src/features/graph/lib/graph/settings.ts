import { throttle } from "../../../../helpers/timing";
import { Graph } from "./graph";
import { GraphSettingsState } from "@graphcalculator/types";

export class GraphSettings {
  MAX_TRANSLATE = 1000000;
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

    const centerZoomRadius: number = 75;
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
        Math.abs(e.prevdOriginX) > centerZoomRadius ||
        Math.abs(e.prevdOriginY) > centerZoomRadius
      ) {
        const pushX = Math.floor(e.scaleDx);
        const pushY = Math.floor(e.scaleDy);

        this.offsetX += -pushX;
        this.offsetY += -pushY;
        this.updateClientPosition(this.offsetX, this.offsetY);
        this.graph.ctx.translate(-pushX, -pushY);
      }
    });

    let lastMouseX = 0;
    let lastMouseY = 0;
    let pointerId: number | null = null;

    this.graph.canvas.addEventListener(
      "pointerdown",
      (e) => {
        const { graphX, graphY } = this.graph.scales.calculateGraphCoordinates(
          e.offsetX,
          e.offsetY
        );

        const customEvent = {
          graphX,
          graphY,
          preventDefault() {
            this.defaultPrevented = true;
          },
          defaultPrevented: false,
          pointerId: e.pointerId,
        };
        this.graph.dispatch("pointerDown", customEvent);

        if (customEvent.defaultPrevented) {
          return;
        }

        if (pointerId === null) {
          pointerId = e.pointerId;
        } else {
          if (e.pointerId !== pointerId) {
            const ev = new Event("pointerup");
            this.graph.canvas.dispatchEvent(ev);
            return;
          }
        }

        e.preventDefault();
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        this.graph.canvas.setPointerCapture(pointerId);
        this.graph.canvas.addEventListener("pointermove", throttleMouseMove);
        this.graph.canvas.addEventListener(
          "pointerup",
          () => {
            this.graph.canvas.releasePointerCapture(pointerId!);
            pointerId = null;
            this.graph.canvas.removeEventListener(
              "pointermove",
              throttleMouseMove
            );
          },
          { signal: this.destroyController.signal, once: true }
        );
      },
      { signal: this.destroyController.signal }
    );

    const throttleMouseMove = (e: PointerEvent) => {
      if (this.graph.destroyed) return;

      if (pointerId !== e.pointerId) return;

      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      this.offsetX += dx;
      this.offsetY += dy;
      this.updateClientPosition(this.offsetX, this.offsetY);

      this.graph.ctx.translate(dx, dy);
    };
  }

  private updateClientPosition(offsetX: number, offsetY: number) {
    this.clientLeft = -this.canvasCenterX - offsetX;
    this.clientRight = this.canvasCenterX - offsetX;
    this.clientTop = -this.canvasCenterY - offsetY;
    this.clientBottom = this.canvasCenterY - offsetY;
  }

  reset() {
    // reset canvas settings

    this.canvasCenterX = Math.round(this.graph.canvas.width / 2);
    this.canvasCenterY = Math.round(this.graph.canvas.height / 2);
    this.graph.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.graph.ctx.translate(this.canvasCenterX, this.canvasCenterY);

    this.offsetX = 0;
    this.offsetY = 0;
    this.updateClientPosition(this.offsetX, this.offsetY);

    // reset ctx settings

    this.graph.ctx.font = `500 ${12 * this.dpr}px Inter`;
    this.graph.ctx.textAlign = "center";
    this.graph.ctx.textBaseline = "middle";
  }

  getState(): GraphSettingsState {
    return { offsetX: this.offsetX, offsetY: this.offsetY };
  }

  restoreState(state: GraphSettingsState) {
    this.graph.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.graph.ctx.translate(
      this.canvasCenterX + state.offsetX,
      this.canvasCenterY + state.offsetY
    );

    this.offsetX = state.offsetX;
    this.offsetY = state.offsetY;
    this.updateClientPosition(this.offsetX, this.offsetY);
  }

  destroy() {
    this.destroyController.abort();
    this.resizeObserver.disconnect();
  }
}
