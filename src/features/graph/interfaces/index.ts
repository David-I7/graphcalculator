import { Graph } from "../lib/graph/graph";
import { MouseEvent, ScaleEvent } from "../lib/graph/graphEvents";

export const eventMap: Record<Event_Name, new (graph: Graph) => BusEvent> = {
  scale: ScaleEvent,
  mouseDown: MouseEvent,
};

type BaseEventDefaults = {
  preventDefault: () => void;
  defaultPrevented: boolean;
};

export type ScaleEventData = {
  zoomDirection: "IN" | "OUT";
  offsetX: number;
  offsetY: number;
} & BaseEventDefaults;
export type MouseEventData = {
  graphX: number;
  graphY: number;
} & BaseEventDefaults;

export type EventDataMap = {
  scale: ScaleEventData;
  mouseDown: MouseEventData;
};

export type Event_Name = keyof EventDataMap;

export interface BusEvent<T extends keyof EventDataMap = keyof EventDataMap> {
  readonly callbacks: Function[];
  register(cb: Function): void;
  deregister(cb: Function): void;
  execute(event: EventDataMap[T]): void;
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
