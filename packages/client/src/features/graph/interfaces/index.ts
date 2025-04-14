import { Graph } from "../lib/graph/graph";
import { PointerDownEvent, ScaleEvent } from "../lib/graph/graphEvents";

export const eventMap: Record<Event_Name, new (graph: Graph) => BusEvent> = {
  scale: ScaleEvent,
  pointerDown: PointerDownEvent,
};

type BaseEventDefaults = {
  preventDefault: () => void;
  defaultPrevented: boolean;
};

export type ScaleEventData = {
  zoomDirection: "IN" | "OUT";
  graphX: number;
  graphY: number;
  prevdOriginX: number;
  prevdOriginY: number;
  scaleDx: number;
  scaleDy: number;
} & BaseEventDefaults;
export type PointerDownEventData = {
  graphX: number;
  graphY: number;
  pointerId: number;
} & BaseEventDefaults;

export type EventDataMap = {
  scale: ScaleEventData;
  pointerDown: PointerDownEventData;
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
  destroy?(): void;
}

export interface GraphCommandController {
  readonly commands: GraphCommand[];
  add(command: GraphCommand): void;
  remove(command: GraphCommand): void;
  render(graph: Graph): void;
  clear(graph: Graph): void;
}
