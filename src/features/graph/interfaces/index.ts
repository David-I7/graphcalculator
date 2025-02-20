import { GRAPH_EVENT_NAMES } from "../data/events";
import { Graph } from "../lib/graph/graph";

export type ScaleEventData = {
  zoomDirection: "IN" | "OUT";
  offsetX: number;
  offsetY: number;
};

export type EventDataMap = {
  scale: ScaleEventData;
};

export type Event_Name = (typeof GRAPH_EVENT_NAMES)[number];

export interface BusEvent {
  readonly callbacks: Function[];
  register(cb: Function): void;
  deregister(cb: Function): void;
  execute<T>(data: T): void;
  destroy(): void;
}

export interface MessageBus {
  readonly events: Record<string, BusEvent>;
  dispatch<K extends keyof EventDataMap>(
    eventName: K,
    data: EventDataMap[K]
  ): void;
  on<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void;
  removeListener<K extends keyof EventDataMap>(
    eventName: K,
    cb: (event: EventDataMap[K]) => void
  ): void;
}

export interface GraphCommand {
  readonly graph: Graph;
  draw(): void;
}

export interface GraphCommandController {
  readonly commands: GraphCommand[];
  add(command: GraphCommand): void;
  remove(command: GraphCommand): void;
  render(): void;
  clear(graph: Graph): void;
}
