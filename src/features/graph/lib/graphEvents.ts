import { BusEvent } from "../interfaces";

export class ScaleEvent implements BusEvent {
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
