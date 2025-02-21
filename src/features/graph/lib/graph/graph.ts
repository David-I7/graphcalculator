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
import { GraphSettings } from "./settings";

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
    this.settings = new GraphSettings(this);
    this.commandController = new CommandController();
    this.scales = new Scales(this, 25, 15);
  }

  get dpr() {
    return this.settings.dpr;
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
    Object.entries(this.events).forEach((entry) => entry[1].destroy());
  }
}
