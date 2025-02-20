import { BusEvent } from "../../interfaces";
import { Graph } from "./graph";

export class ScaleEvent implements BusEvent {
  protected destroyController: AbortController | null = null;
  public callbacks: Function[] = [];
  constructor(public graph: Graph) {
    this.init();
  }

  init() {
    this.destroyController = new AbortController();
    this.graph.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomDirection = e.deltaY > 0 ? "OUT" : "IN";

        this.graph.dispatch("scale", {
          zoomDirection,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
        });
      },
      { passive: false, signal: this.destroyController.signal }
    );
  }

  destroy() {
    this.destroyController!.abort();
    this.callbacks = [];
    this.destroyController = null;
  }

  register(cb: Function): void {
    if (!this.destroyController) {
      this.init();
    }

    this.callbacks.push(cb);
  }
  deregister(cb: Function): void {
    for (let i = 0; i < this.callbacks.length; ++i) {
      if (this.callbacks[i] === cb) {
        this.callbacks.splice(i, 1);
        break;
      }
    }

    if (this.callbacks.length === 0) {
      this.destroy();
    }
  }
  execute<T>(data: T): void {
    this.callbacks.forEach((callback) => {
      callback(data);
    });
  }
}
