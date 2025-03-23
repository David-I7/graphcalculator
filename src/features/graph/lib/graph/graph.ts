import { eventMap } from "../../interfaces";
import {
  BusEvent,
  EventDataMap,
  GraphCommand,
  GraphCommandController,
  MessageBus,
} from "../../interfaces";
import { CommandController } from "./commands";
import { Scales, ScalesState } from "./scales";
import { GraphSettings, GraphSettingsState } from "./settings";

export type GraphSnapshot = {
  settings: GraphSettingsState;
  scales: ScalesState;
  image: ReturnType<HTMLCanvasElement["toDataURL"]>;
};

export type LibGraph = Graph;

export class Graph implements MessageBus {
  readonly events: Partial<Record<keyof EventDataMap, BusEvent>> = {};
  protected commandController: GraphCommandController;
  protected settings!: GraphSettings;
  readonly scales: Scales;
  public destroyed: boolean = false;

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D
  ) {
    this.scales = new Scales(this, 25, 100);
    this.settings = new GraphSettings(this);
    this.commandController = new CommandController();
  }

  get dpr() {
    return this.settings.dpr;
  }
  get MAX_TRANSLATE() {
    return this.settings.MAX_TRANSLATE;
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

  dispatch<K extends keyof EventDataMap>(
    eventName: K,
    data: EventDataMap[K]
  ): ReturnType<BusEvent["execute"]> {
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
      const busEvent = new eventMap[eventName](this);
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
    this.scales.destroy();
    Object.entries(this.events).forEach((entry) => entry[1].destroy());
  }

  reset() {
    this.settings.reset();
    this.scales.reset();
  }

  getStateSnapshot(): Omit<GraphSnapshot, "image"> {
    return {
      settings: this.settings.getState(),
      scales: this.scales.getState(),
    };
  }
  toDataURL(): string {
    return this.canvas.toDataURL("image/webp", 0.9);
  }
  restoreStateSnapshot(snapshot: Omit<GraphSnapshot, "image">) {
    this.settings.restoreState(snapshot.settings);
    this.scales.restoreState(snapshot.scales);
  }
}
