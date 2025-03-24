import {
  BusEvent,
  PointerDownEventData,
  ScaleEventData,
} from "../../interfaces";
import { Graph } from "./graph";

// TODO
// detect if user is clicking on a function,
// make point labels on mouse down (do not allow dragging while the function is focused)

export class ScaleEvent implements BusEvent {
  public callbacks: Function[] = [];
  constructor(public graph: Graph) {}

  destroy() {
    this.callbacks = [];
  }

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
  execute(event: ScaleEventData): void {
    this.callbacks.forEach((callback) => {
      callback(event);
    });
  }
}

export class PointerDownEvent implements BusEvent {
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

  execute(event: PointerDownEventData): void {
    for (let i = this.callbacks.length - 1; i >= 0; --i) {
      this.callbacks[i](event);
      if (event.defaultPrevented) return;
    }
  }

  destroy(): void {
    this.callbacks = [];
  }
}
