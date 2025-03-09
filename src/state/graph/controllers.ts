// GRAPH

import { CSS_VARIABLES } from "../../data/css/variables";
import { restrictedVariables } from "../../features/graph/data/math";
import { AdjacencyList, SerializedAdjList } from "../../helpers/dts";
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
      dependencyGraph: {},
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
  const depGraph: SerializedAdjList = {};
  let maxId: number = 1;

  for (let i = 0; i < graph.items.length; i++) {
    const item = graph.items[i];
    maxId = Math.max(maxId, item.id);

    if (isExpression(item) && item.data.parsedContent) {
      if (item.data.type === "variable") {
        scope[item.data.parsedContent.name] = item.data.parsedContent.value;
        addDependencies(
          item.data.parsedContent.name,
          item.data.parsedContent.scopeDeps,
          depGraph
        );
      } else if (item.data.type == "function") {
        const fnName = item.data.parsedContent.name;
        if (restrictedVariables.has(fnName)) continue;
        scope[fnName] = item.data.parsedContent.node;
        addDependencies(fnName, item.data.parsedContent.scopeDeps, depGraph);
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
      dependencyGraph: depGraph,
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

export function deleteFromScope(
  deleted: string,
  depGraph: SerializedAdjList,
  scope: Scope
) {
  const queue: string[] = [deleted];

  while (queue.length) {
    const v = queue.pop()!;
    if (!(v in scope)) continue;
    delete scope[v];

    const edges = depGraph[v];

    edges.forEach((edge) => {
      if (edge in scope) {
        queue.push(edge);
      }
    });
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

export function dependenciesInScope(depArray: string[], scope: Scope) {
  for (let i = 0; i < depArray.length; i++) {
    if (depArray[i] in scope) continue;
    return false;
  }
  return true;
}

export function addDependencies(
  variable: string,
  depArray: string[],
  graph: SerializedAdjList
) {
  if (depArray.length) {
    depArray.forEach((dep) => {
      AdjacencyList.addNode(dep, graph);
      AdjacencyList.addEdge(dep, variable, graph);
    });
  }
  AdjacencyList.addNode(variable, graph);
}

export function removeDependencies(
  variable: string,
  depArray: string[],
  graph: SerializedAdjList
) {
  depArray.forEach((dep) => {
    const edges = graph[dep];
    for (let i = 0; i < edges.length; i++) {
      if (edges[i] === variable) {
        edges.splice(i, 1);
        break;
      }
    }
  });
}
