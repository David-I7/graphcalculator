// GRAPH

import { CSS_VARIABLES } from "../../data/css/variables";
import {
  ClientGraphData,
  GraphData,
  isExpression,
  Item,
  ItemData,
  ItemType,
  Scope,
} from "./types";

export function createNewGraph(): ClientGraphData {
  const createdAt = new Date().toJSON();
  return {
    id: crypto.randomUUID(),
    createdAt,
    modifiedAt: createdAt,
    thumb: "",
    name: "Untitled",
    items: {
      scope: { e: Math.E, pi: Math.PI },
      nextId: 2,
      focusedId: 1,
      data: [createNewItem("expression", 1)],
    },
  };
}

export function saveCurrentGraph(currentGraph: ClientGraphData): GraphData {
  // apiReq to server in the background

  return {
    ...currentGraph,
    modifiedAt: new Date().toJSON(),
    thumb: "", //base64encoded canvasGetImageData
    items: currentGraph.items.data,
  };
}

export function restoreSavedGraph(graph: GraphData): ClientGraphData {
  const scope: Scope = {};
  let maxId: number = 1;

  for (let i = 0; i < graph.items.length; i++) {
    const item = graph.items[i];
    maxId = Math.max(maxId, item.id);

    if (isExpression(item) && item.data.parsedContent) {
      if (item.data.type === "variable") {
        scope[item.data.parsedContent.name] = item.data.parsedContent.value;
      } else if (item.data.type == "function") {
        const fnName = item.data.parsedContent.name;

        if (fnName === "f" || fnName === "x" || fnName === "y") continue;
        scope[fnName] = item.data.content;
      }
    }
  }

  return {
    ...graph,
    items: {
      scope,
      nextId: maxId + 1,
      focusedId: -1,
      data: graph.items,
    },
  };
}

// ITEM

export function createNewItem<T extends ItemType>(
  type: T,
  id: number,
  content?: string
): Item {
  if (type === "expression") {
    return {
      id,
      type,
      data: {
        type: "function",
        content: content ? content : "",
        parsedContent: undefined,
        settings: {
          color: `hsl(${Math.floor(Math.random() * 360)},${
            CSS_VARIABLES.baseSaturation
          },${CSS_VARIABLES.baseLightness})`,
          hidden: false,
        },
      },
    } as Item<"expression">;
  }

  return {
    id,
    type,
    data: {
      content: "",
    },
  } as Item<"note">;
}

// SCOPE

export function deleteFromScope(data: ItemData["expression"], scope: Scope) {
  if (data.type == "variable" && data.parsedContent) {
    if (data.parsedContent.name in scope) delete scope[data.parsedContent.name];
  } else if (data.type === "function" && data.parsedContent) {
    if (data.parsedContent.name in scope) delete scope[data.parsedContent.name];
  }
}

export function isInScope(
  target: string,
  data: ItemData["expression"],
  scope: Scope
): boolean {
  if (target in scope) {

    if (data.type === "variable" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    } else if (data.type === "function" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    }
    return true;
  }

  return false;
}

// export function updateScopedDependants(parsedContent) {

// }
