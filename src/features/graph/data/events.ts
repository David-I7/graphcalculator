import { BusEvent, Event_Name } from "../interfaces";
import { Graph } from "../lib/graph/graph";
import { ScaleEvent } from "../lib/graph/graphEvents";

export const GRAPH_EVENT_NAMES = ["scale"] as const;

export const eventMap: Record<Event_Name, new (graph: Graph) => BusEvent> = {
  scale: ScaleEvent,
};
