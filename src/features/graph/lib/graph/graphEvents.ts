import { BusEvent, MouseEventData, ScaleEventData } from "../../interfaces";
import { Graph } from "./graph";

// TODO
// detect if user is clicking on a function,
// make point labels on mouse down (do not allow dragging while the function is focused)

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

        const event: ScaleEventData = {
          zoomDirection,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          preventDefault() {
            this.defaultPrevented = true;
          },
          defaultPrevented: false,
        };

        this.execute(event);
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
  execute(event: ScaleEventData): void {
    this.callbacks.forEach((callback) => {
      callback(event);
    });
  }
}

export class MouseEvent implements BusEvent {
  protected destroyController: AbortController | null = null;
  public callbacks: Function[] = [];
  constructor(public graph: Graph) {}

  register(cb: Function): void {
    this.callbacks.push(cb);
  }

  deregister(cb: Function): void {
    for (let i = 0; i < this.callbacks.length; ++i) {
      if (this.callbacks[i] === cb) {
        this.callbacks.splice(i, 1);
      }
    }
  }

  execute(event: MouseEventData): void {
    for (let i = this.callbacks.length - 1; i >= 0; --i) {
      this.callbacks[i](event);
      if (event.defaultPrevented) return;
    }
  }

  destroy(): void {}
}
